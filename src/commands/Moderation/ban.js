const { stripIndents } = require("common-tags");
const { format, utcToZonedTime } = require("date-fns-tz");
const preban = require("../../database/models/preban");
const punishments = require("../../database/models/punishments");
const { getMember, getUser } = require("../../modules/functions/getters");
const { punishmentLog } = require("../../modules/functions/moderation");

module.exports = {
    info: {
        name: "ban",
        aliases: [],
        usage: "ban <user> [reason]",
        examples: ["ban @waitrose", "ban 420325176379703298 Bad dev"],
        description: "Bans a user from the server",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "BAN_MEMBERS",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "user",
            type: "USER",
            description: "The user you wish to ban.",
            required: true
        }, {
            name: "reason",
            type: "STRING",
            description: "The reason for the ban.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // 1. Get the requested member
        // 2. Define the reason, and set a default if none was provided
        // 3. Get the ID of this action
        const member = await getMember(message, args[0], true) || await getUser(bot, message, args[0], true),
        reason = args.splice(1, args.length).join(" ") || "No reason provided",
        action = await punishments.countDocuments({ guild: message.guild.id }) + 1 || 1;
        
        // If the member doesn't exist/isn't part of the guild, then return an error
        if (!member)
            return message.errorReply("You did not specify a valid user!");
        
        // If the member's ID is the author's ID, then return an error
        if (member.id === message.author.id)
            return message.errorReply("You are unable to ban yourself!");
        
        if (member.guild) {
            // If the member's highest role is higher than the executors highest role, then return an error
            if (member.roles.highest.position >= message.member.roles.highest.position)
                return message.errorReply({ content: "Questioning authority are we? Sorry, but this isn't a democracy...", files: ["https://i.imgur.com/K9hmVdA.png"] });

            // If the bot cannot ban the user, then return an error
            if (!member.bannable)
                return message.errorReply("I am not able to ban this member! *They may have a higher role than me!*");

            try {
                // Try and send the member a DM stating that they were banned - Catch silently if there is an issue
                await member.send(`:hammer: You have been banned from **${message.guild.name}** for \`${reason}\``).catch(() => { });

                // Ban the member, remove 1d of messages & set the reason
                member.ban({ days: 1, reason: `[Case: ${action} | ${message.author.tag} on ${format(utcToZonedTime(Date.now(), message.settings.general.timezone), "PPp (z)", { timeZone: message.settings.general.timezone })}] ${reason}]` });

                // Send a message confirming the action
                message.confirmationReply(`\`${member.user.tag}\` was banned for **${reason}** *(Case #${action})*`);

                // Create the punishment record in the DB
                await punishments.create({
                    id: action,
                    guild: message.guild.id,
                    type: "ban",
                    user: member.id,
                    moderator: message.author.id,
                    actionTime: Date.now(),
                    reason: reason
                });

                // Send the punishment to the log channel
                punishmentLog(message, member.user, action, reason, "ban");
            } catch (e) {
                // Catch any errors during the ban process & send error message
                message.errorReply(`There was an issue banning \`${member.user.tag}\` - \`${e.message}\``);
            }
        } else {
            // If the member is not part of the server, but the ID does exist, then we'll add them to the pre-ban database
            // This means that if/when they join the guild, they will be banned
            if (await preban.findOne({ user: member.id }))
                return message.errorReply("That user will already be banned if they join the server!");
            
            // Send chat message stating member was banned
            message.confirmationReply(stripIndents`${member.tag} was banned for **${reason}** 
            *The user is not currently in this server, so will be banned upon joining*`);

            // Add the ban to the preban database
            await preban.create({
                user: member.id,
                guild: message.guild.id,
                reason: reason,
                executor: message.author.id
            });

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: message.guild.id,
                type: "ban",
                user: member.id,
                moderator: message.author.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Send the punishment to the log channel
            punishmentLog(message, member, action, reason, "ban");
        }
    },

    run_interaction: async (bot, interaction) => {

        // 1. Get the user from the interaction
        // 2. Get the reason from the interaction, or set to a default if wasn't given
        // 3. Get the punishment ID
        const user = interaction.options.get("user"),
        reason = interaction.options.get("reason")?.value || "No reason specified",
        action = await punishments.countDocuments({ guild: interaction.guild.id }) + 1 || 1;
        
        // If the user they want to ban is themselves, then return an error
        if (interaction.member.id === user.user.id)
            return interaction.reply("You are unable ban yourself!");
        
        if (user.member) {

            if (user.member.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({ content: "Questioning authority are we? Sorry, but this isn't a democracy...", files: ["https://i.imgur.com/K9hmVdA.png"] });

            if (!interaction.guild.members.cache.get(user.user.id).bannable)
                return interaction.reply("I can't ban that member! *They may have a higher role than me!*");
            
            await user.member.send(`:hammer: You have been banned from **${interaction.guild.name}** for \`${reason}\``).catch(() => { });
            user.member.ban({ days: 1, reason: `[Case: ${action} | ${interaction.member.user.tag} on ${format(utcToZonedTime(Date.now(), interaction.settings.general.timezone), "PPp (z)", { timeZone: interaction.settings.general.timezone })}] ${reason}]` });
            interaction.confirmation(`\`${user.user.tag}\` was banned for **${reason}** *(Case #${action})*`);
            
            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: interaction.guild.id,
                type: "ban",
                user: user.member.id,
                moderator: interaction.member.id,
                actionTime: Date.now(),
                reason: reason
            });
            
            // Send the punishment to the log channel
            punishmentLog(interaction, user.user, action, reason, "ban");
        } else {
            // If the member is not part of the server, but the ID does exist, then we'll add them to the pre-ban database
            // This means that if/when they join the guild, they will be banned
            if (await preban.findOne({ user: user.user.id }))
                return interaction.error("That user will already be banned if they join the server!");
            
            // Send chat message stating member was banned
            interaction.confirmation(stripIndents`${user.user.tag} was banned for **${reason}** 
            *The user is not currently in this server, so will be banned upon joining*`);

            // Add the ban to the preban database
            await preban.create({
                user: user.user.id,
                guild: interaction.guild.id,
                reason: reason,
                executor: interaction.member.id
            });

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: interaction.guild.id,
                type: "ban",
                user: user.user.id,
                moderator: interaction.member.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Send the punishment to the log channel
            punishmentLog(interaction, user.user, action, reason, "ban");
        }
    }
};