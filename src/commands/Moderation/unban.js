const config = require("../../config");
const preban = require("../../database/models/preban");
const punishments = require("../../database/models/punishments");
const { getUser } = require("../../modules/functions/getters");
const { punishmentLog } = require("../../modules/functions/moderation");

module.exports = {
    info: {
        name: "unban",
        aliases: [],
        usage: "unban <user> [reason]",
        examples: ["unban Waitrose", "unban 420325176379703298 False ban"],
        description: "Unban a user from the server",
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
            description: "The user you wish to unban.",
            required: true
        }, {
            name: "reason",
            type: "STRING",
            description: "The reason for the unban.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        const bans = await message.guild.bans.fetch(),
            reason = args.slice(1).join(" ") || "No reason provided",
            match = /<@!?(\d{17,19})>/g.exec(args[0]),
            action = await punishments.countDocuments({ guild: message.guild.id }) + 1 || 1,
            publicLog = message.guild.channels.cache.get(message.settings.logs.unban);

        // If the regex matches replace args[0]
        if (match)
            args[0] = match[1];

        // Try to find the ban
        const ban = bans.find(u => u.user.id == args[0])
        || bans.find(u => u.user.username.toLowerCase() == args[0].toLowerCase())
        || bans.find(u => u.user.id.includes(args[0]));

        if (ban) {
            // Grab the user
            const user = bot.users.cache.get(ban.user.id);
            // Unban the user
            message.guild.members.unban(ban.user.id, `[Issued by ${message.author.tag}] ${reason}`);
            // Send a confirmation message
            message.confirmationReply(`Successfully unbanned **${ban.user.username}#${ban.user.discriminator}**! *(Case #${action})*`);

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: message.guild.id,
                type: "unban",
                user: ban.user.id,
                moderator: message.author.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Log the unban
            punishmentLog(message, user, null, reason, "unban");
            // Send public ban log message, if it exists
            if (message.guild.channels.cache.has(message.settings.logs.ban))
                publicLog.send(`${config.emojis.bans} **${ban.user.username}#${ban.user.discriminator}** was unbanned for **${reason}**`);
        } else {
            // Attempt to get the user
            const user = await getUser(bot, message, args[0], false);

            // If the user doesn't exist/isn't valid then return an error
            if (!user)
                message.errorReply("You did not specify a valid user");

            // Find the ban in the preban database
            const pban = await preban.findOne({ user: user.id });

            // If the preban database doesn't have the user, and the user doesn't exist in the guild's bans
            // then return an error
            if (!pban && !ban)
                return message.errorReply("You didn't specify a banned user!");

            // Find the ban in the preban database
            await preban.findOneAndDelete({ user: user.id });
            // Send a confirmation message
            message.confirmationReply(`Successfully unbanned **${user.tag}**! *(Case #${action})*`);
            // Log the unban
            punishmentLog(message, user, null, reason, "unban");
            // Send public ban log message, if it exists
            if (message.guild.channels.cache.has(message.settings.logs.ban))
                publicLog.send(`${config.emojis.bans} **${user.tag}** was unbanned for **${reason}**`);
        }
    },

    run_interaction: async (bot, interaction) => {

        // 1. Fetch all guild bans
        // 2. Get the user specified
        // 3. Get the reason for the unban, or default if not specified
        // 4. Get the case id
        const bans = await interaction.guild.bans.fetch(),
        user = interaction.options.get("user"),
        reason = interaction.options.get("reason")?.value || "No reason specified",
        action = await punishments.countDocuments({ guild: interaction.guild.id }) + 1 || 1,
        publicLog = interaction.guild.channels.cache.get(interaction.settings.logs.unban);

        // Try to find the ban
        const ban = bans.find(u => u.user.id == user.user.id);

        if (ban) {
            // Unban the user
            interaction.guild.members.unban(user.user.id, `[Issued by ${interaction.member.user.tag}] ${reason}`);
            // Send a confirmation message
            interaction.confirmation(`Successfully unbanned **${user.user.tag}**! *(Case #${action})*`);

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: interaction.guild.id,
                type: "unban",
                user: user.user.id,
                moderator: interaction.member.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Log the unban
            punishmentLog(interaction, user, null, reason, "unban");
            // Send public ban log message, if it exists
            if (interaction.guild.channels.cache.has(interaction.settings.logs.ban))
                publicLog.send(`${config.emojis.unban} **${user.user.tag}** was unbanned for **${reason}**`);
        } else {
            // Find the ban in the preban database
            const pban = await preban.findOne({ user: user.user.id });

            // If the preban database doesn't have the user, and the user doesn't exist in the guild's bans
            // then return an error
            if (!pban && !ban)
                return interaction.error("You didn't specify a banned user!");

            // Find the ban in the preban database
            await preban.findOneAndDelete({ user: user.user.id });
            // Send a confirmation message
            interaction.confirmation(`Successfully unbanned **${user.user.tag}**! *(Case #${action})*`);
            // Log the unban
            punishmentLog(interaction, user, null, reason, "unban");
            // Send public ban log message, if it exists
            if (interaction.guild.channels.cache.has(interaction.settings.logs.ban))
                publicLog.send(`${config.emojis.unban} **${user.user.tag}** was unbanned for **${reason}**`);
        }
    }
};