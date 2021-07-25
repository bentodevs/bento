const mutes = require("../../database/models/mutes");
const settings = require("../../database/models/settings");
const punishments = require("../../database/models/punishments");
const { getMember } = require("../../modules/functions/getters");
const { formatDistanceToNowStrict } = require("date-fns");
const { punishmentLog } = require("../../modules/functions/moderation");
const { parseTime } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "mute",
        aliases: ["shut"],
        usage: "mute <user> <time> [reason]",
        examples: ["mute Jarno 1h Bald"],
        description: "Mute a user",
        category: "Moderation",
        info: "You may specify a time to mute a user for (I.e. 1h), or use \"forever\"",
        options: []
    },
    perms: {
        permission: "MANAGE_MESSAGES",
        type: "discord",
        self: ["MANAGE_ROLES"]
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
            description: "The user you wish to mute.",
            required: true
        }, {
            name: "time",
            type: "STRING",
            description: "The length of mute.",
            required: false
        }, {
            name: "reason",
            type: "STRING",
            description: "The reason for the mute.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // Check that the mute role exists in the DB
        if (!message.settings.roles.mute)
            return message.errorReply(`There is no mute role configured! Create one using \`${message.settings.general.prefix}setup muterole [role]\``);
        
        // If the mute role we have doesn't exist, then remove it from the DB & send an error
        if (!message.guild.roles.cache.get(message.settings.roles.mute)) {
            await settings.findOneAndUpdate({ _id: message.guild.id }, { "roles.mute": null });
            return message.errorReply(`The mute role I knew was deleted! You'll need to set up up again using \`${message.settings.general.prefix}setup mute [role]\``);
        }
        
        // If there are no args[0] (User), then return an error
        // 1. Get the member requested
        // 2. Get the muted role
        // 3. Caclulate the new action ID
        // 4. Get any pre-existing mute for the user which is active
        const member = await getMember(message, args[0], true),
            muterole = message.guild.roles.cache.get(message.settings.roles.mute),
            action = await punishments.countDocuments({guild: message.guild.id}) + 1 || 1,
            mute = await mutes.findOne({ guild: message.guild.id, mutedUser: member?.id});
        
        let time, reason = "";

        // If there is no member, then return an error
        if (!member)
            return message.errorReply("You did not specify a valid member!");
        
        // Check if the member ID is equal to the executors id
        if (member.id === message.author.id)
            return message.errorReply("You cannot mute yourself!");
        
        // Check the member doesn't have a higher or equal role- if they do then throw error
        if (member.roles.highest.position >= message.member.roles.highest.position)
            return message.errorReply("You are unable to mute those of the same or a higher rank!");
        
        // If the time is "forever" then set the time variable to "forever"
        if (args[1]?.toLowerCase() === "forever" && !args[2]) {
            time = "forever";
            reason = "No reason specified";
        } else if (args[1]?.toLowerCase() === "forever" && args[2]) {
            time = "forever";
            reason = args.slice(2).join(" ");
        } else {
            // Try and convert the time to a ms value with timesting library
            if (args[1]) time = parseTime(args[1], 'ms');
            // If there is no time, but there are arguments, then set the reason as args1 onwards
            if (!time && args[1]) reason = args.slice(1).join(" ");
            // If time is valid & there are more args, assign the reason as args2 onwards
            if (time && args[2]) reason = args.slice(2).join(" ");
            // If there is no time, and no args, then mute for default time and specify a default reason
            if (!time && !args[1]) reason = "No reason specified";
            // If time is valid, but no further args, specify a default reason
            if (time && !args[2]) reason = "No reason specified";
            // Defaults to 30m if no specified time
            if (!time) time = 1800000;
            // Reject mute over 1 year & below 1 minute
            if (time >= 31557600000) return message.errorReply("You cannot mute someone for 1 year (or longer)!");
            if (time < 60000) return message.errorReply("The minimum time for a mute is 1 minute!");
        }

        // Add the role to the user, add reason
        member.roles.add(muterole, `[Issued by ${message.author.tag}] ${reason}`);
        // Message the user informing them of the action
        await member.send(`🔇 You have been muted in **${message.guild.name}** ${time == "forever" ? "for **forever**" : `for **${formatDistanceToNowStrict(Date.now() + time)}**`} with the reason **${reason}**`).catch(() => { });
        // Send confirmation message
        message.confirmationReply(`**${member.user.tag}** has been ${mute ? "re" : ""}muted ${time == "forever" ? "**forever**" : `for **${formatDistanceToNowStrict(Date.now() + time)}**`}! *(Case ID: ${action})*`);
        
        if (mute)
            await mutes.findOneAndDelete({ guild: message.guild.id, mutedUser: member.id });

        // Set mute in DB (Will overwrite any pre-existing mute)
        await mutes.create({
            guild: message.guild.id,
            mutedUser: member.id,
            muteTime: time == "forever" ? "forever" : time,
            mutedBy: message.author.id,
            timeMuted: Date.now(),
            reason: reason,
            caseID: action
        });
        
        // Set punishment in punishment DB
        await punishments.create({
            id: action,
            guild: message.guild.id,
            type: "mute",
            user: member.id,
            moderator: message.author.id,
            actionTime: Date.now(),
            reason: reason,
            muteTime: time == "forever" ? "forever" : time.toString()
        });

        // Send punishment log
        punishmentLog(message, member, action, reason, "mute", (time == "forever" ? "Forever" : `${formatDistanceToNowStrict(Date.now() + time)}`));
    },

    run_interaction: async (bot, interaction) => {
        // Check that the mute role exists in the DB
        if (!interaction.settings.roles.mute)
            return interaction.error(`There is no mute role configured! Create one using \`${interaction.settings.general.prefix}setup\``);
        
        // If the mute role we have doesn't exist, then remove it from the DB & send an error
        if (!interaction.guild.roles.cache.get(interaction.settings.roles.mute)) {
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "roles.mute": null });
            return interaction.error(`The mute role I knew was deleted! You'll need to set up up again using \`${interaction.settings.general.prefix}setup\``);
        }

        // 1. Get the user specified in the interaction
        // 2. Get the length string, if specified
        // 3. Get the reason, if specified
        // 4. Calculate the punishment id
        const user = interaction.options.get("user"),
            reason = interaction.options.get("reason")?.value || "No reason specified",
            action = await punishments.countDocuments({ guild: interaction.guild.id }) + 1 || 1,
            mute = await mutes.findOne({ guild: interaction.guild.id, mutedUser: user.member?.id }),
            muterole = interaction.guild.roles.cache.get(interaction.settings.roles?.mute);
        
        let time = "";

        if (interaction.options.get("time")?.value) {
            time = interaction.options.get("time")?.value;
        } else {
            time = 1800000;
        }
    
        // If the user is not a member of the server, then return an error
        if (!user.member)
            return interaction.error("You did not specify a valid server member to mute!");
        
        // If the user they want to kick is themselves, then return an error
        if (interaction.member.id === user.user.id)
            return interaction.reply("You are unable mute yourself!");

        // If the user has a higher, or equal, role to the executor, then return an error
        if (user.member.roles.highest.position >= interaction.member.roles.highest.position)
            return interaction.error("Questioning authority are we? Sorry, but this isn't a democracy...", { files: ["https://i.imgur.com/K9hmVdA.png"] });
        
        if (time && time !== 1800000) {
            if (time.match(/^[A-Za-z]+$/))
                return "forever";
            
            time = parseTime(time, "ms");
        }

        // Add the role to the user, add reason
        user.member.roles.add(muterole, `[Issued by ${interaction.member.user.tag}] ${reason}`);
        // Message the user informing them of the action
        await user.member.send(`🔇 You have been muted in **${interaction.guild.name}** ${time == "forever" ? "for **forever**" : `for **${formatDistanceToNowStrict(Date.now() + time)}**`} with the reason **${reason}**`).catch(() => { });
        // Send confirmation message
        interaction.confirmation(`**${user.user.tag}** has been ${mute ? "re" : ""}muted ${time == "forever" ? "**forever**" : `for **${formatDistanceToNowStrict(Date.now() + time)}**`}! *(Case ID: ${action})*`);
        
        if (mute)
            await mutes.findOneAndDelete({ guild: interaction.guild.id, mutedUser: user.user.id });

        // Set mute in DB (Will overwrite any pre-existing mute)
        await mutes.create({
            guild: interaction.guild.id,
            mutedUser: user.user.id,
            muteTime: time,
            mutedBy: interaction.member.user.id,
            timeMuted: Date.now(),
            reason: reason,
            caseID: action
        });
        
        // Set punishment in punishment DB
        await punishments.create({
            id: action,
            guild: interaction.guild.id,
            type: "mute",
            user: user.user.id,
            moderator: interaction.member.id,
            actionTime: Date.now(),
            reason: reason,
            muteTime: time == "forever" ? "forever" : time.toString()
        });
    }
};