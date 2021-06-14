const { stripIndents } = require("common-tags");
const { formatDistanceStrict, format } = require("date-fns");
const { MessageEmbed } = require("discord.js");
const punishments = require("../../database/models/punishments");
const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "case",
        aliases: ["hist", "history"],
        usage: "case <case id or user> [page]",
        examples: ["case"],
        description: "View a specific punishment or punishments for a user",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "KICK_MEMBERS",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        if (!isNaN(args[0]) && /^[0-9]{16,}$/.test(args[0])) {
            // Try and fetch a guild member from args[0]
            const member = await getMember(message, args[0], false);

            // If there was no member returned, then send an error
            if (!member)
                return message.error("I couldn't find a user with that ID!");

            // Fetch all punishments from this guild for this user
            const entries = await punishments.find({ guild: message.guild.id, user: member.id });

            // If the returned array is empty, then send an error
            if (entries.length === 0)
                return message.error("This user doesn't have any punishments recorded!");

            // Page variables
            const pages = [];
            let page = 0;

            // Reverse sort the entries (Newest first)
            const casesSorted = entries.sort((a, b) => b.actionTime - a.actionTime);

            // Set cases in page array
            for (let i = 0; i < casesSorted.length; i += 10) {
                pages.push(casesSorted.slice(i, i + 10));
            }

            // Get the correct page, if the user provides a page number
            if (!isNaN(args[1])) page = args[1] -= 1;

            // Check if the user specified a valid page
            if (!pages[page])
                return message.error("You didn't specify a valid page!");
            
            // Format the cases
            const formatted = pages[page].map(p => `**#${p.id}** | **${p.type.toTitleCase()}** | **Reason:** ${p.reason} | ${format(p.actionTime, "PPp")}`);
            
            // Build the history embed
            const embed = new MessageEmbed()
                .setAuthor(`Punishment History for ${member.user.tag}`, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
                .setColor(message.member?.displayHexColor ?? bot.config.general.embedColor)
                .setDescription(formatted.join("\n"))
                .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);
            
            message.channel.send({ embeds: [embed] });
        } else if (!isNaN(args[0])) {
            
            // We are now presuming the number provided is a Case ID...
            // Lookup the case in the punishments DB
            const punishment = await punishments.findOne({ guild: message.guild.id, id: args[0] });

            // If the punishment doesn't exist, then return an error
            if (!punishment)
                return message.error("A punishment with that ID was not found!");
            
            console.log(punishment)
            
            const usr = await getUser(bot, message, punishment.user),
                mod = await getUser(bot, message, punishment.moderator);
            
            // Build the embed
            // "mute" is only added when the punishment type is a mute (Semi-obvious tbh...)
            const embed = new MessageEmbed()
                .setAuthor(`Case #${punishment.id} - ${punishment.type.toTitleCase()}`, usr.displayAvatarURL({ format: "png", dynamic: true }))
                .setColor((message.member.displayHexColor ? message.member.displayHexColor : "#B00B1E"))
                .setDescription(stripIndents`**User:** \`${usr.tag}\`
                **Moderator:** \`${mod.tag}\`
                **Reason:** ${punishment.reason}
                ${punishment.type === "mute" ? `**Duration:** ${punishment.muteTime == "forever" ? "never" : `${formatDistanceStrict(parseInt(punishment.actionTime), parseInt(punishment.actionTime) + parseInt(punishment.muteTime))}`}` : ""}`)
                .setTimestamp(punishment.actionTime)
                .setThumbnail(usr.displayAvatarURL({ format: "png", dynamic: true }))
                .setFooter(`Requested by ${message.author.tag}`);
            
            // Send the embed
            message.channel.send({ embeds: [embed] });
            
        } else {
            // Try and fetch a guild member from args[0]
            const member = await getMember(message, args[0], false);

            if (!member)
                return message.error("You did not specify a valid member!");
            
            // Fetch all punishments from this guild for this user
            const entries = await punishments.find({ guild: message.guild.id, user: member.id });

            // If the returned array is empty, then send an error
            if (entries.length === 0)
                return message.error("This user doesn't have any punishments recorded!");

            // Page variables
            const pages = [];
            let page = 0;

            // Reverse sort the entries (Newest first)
            const casesSorted = entries.sort((a, b) => b.actionTime - a.actionTime);

            // Set cases in page array
            for (let i = 0; i < casesSorted.length; i += 10) {
                pages.push(casesSorted.slice(i, i + 10));
            }

            // Get the correct page, if the user provides a page number
            if (!isNaN(args[1])) page = args[1] -= 1;

            // Check if the user specified a valid page
            if (!pages[page])
                return message.error("You didn't specify a valid page!");
            
            // Format the cases
            const formatted = pages[page].map(p => `**#${p.id}** | **${p.type.toTitleCase()}** | **Reason:** ${p.reason} | ${format(p.actionTime, "PPp")}`);
            
            // Build the history embed
            const embed = new MessageEmbed()
                .setAuthor(`Punishment History for ${member.user.tag}`, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
                .setColor(message.member.displayHexColor ? message.member.displayHexColor : bot.config.general.embedColor)
                .setDescription(formatted.join('\n'))
                .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);
            
            // Send the history embed
            message.channel.send({ embeds: [embed] });
        }
    }
};