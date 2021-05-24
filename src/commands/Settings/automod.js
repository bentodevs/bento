const { MessageEmbed } = require("discord.js");
const settings = require("../../database/models/settings");

module.exports = {
    info: {
        name: "automod",
        aliases: [],
        usage: "automod [option] [value]",
        examples: [
            "automod no-invite disable",
            "automod mentions-ban 10",
            "automod filter enable"
        ],
        description: "Change automod settings",
        category: "Settings",
        info: null,
        options: [
            "`filter` - Enable or disable the filter",
            "`zalgo` - Enable or disable the ability to send [Zalgo Text](https://en.wikipedia.org/wiki/Zalgo_text)",
            "`no-invite` - Enable or disable the ability to send other guild invites",
            "`no-link` - Enable or disable the ability to send links",
            "`selfbots` - Enable or disable the ability for people to use selfbots",
            "`mentions-mute` - Set the maximum amount of users that can be mentioned before the sender is muted",
            "`mentions-ban` - Set the maximum amount of users that can be mentioned before the sender is muted"
        ]
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        const options = ["enable", "disable"];

        if (!args[0]) {

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Auto-mod settings for ${message.guild.name}`, message.guild.iconURL({ format: "png", dynamic: true }))
                .setColor(message.member.displayHexColor ?? bot.config.general.embedColor)
                .setDescription(`🧮 Message filtering is currently ${message.settings.moderation.filter?.state ? "**enabled**" : "**disabled**"}
                ⌨️ Using [Zalgo Text](https://en.wikipedia.org/wiki/Zalgo_text) is currently ${message.settings.moderation.filter?.zalgo ? "**disallowed**" : "**allowed**"}
                🖇️ Invite posting is currently ${message.settings.moderation.no_invite ? "**disallowed**" : "**allowed**"}
                🌐 Link posting is currently ${message.settings.moderation.no_link ? "**disallowed**" : "**allowed**"}
                
                🔇 The number of allowed mentions before being muted is ${message.settings.moderation.mentions_mute || "**not set**"}
                <:PeepoPing:842359606697132073> The number of allowed mentions before being banned is ${message.settings.moderation.mentions_ban || "**not set**"}`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ format: "png", dynamic: true }));
            
            // Send embed
            message.channel.send(embed);
        } else if (args[0].toLowerCase() === "filter") {
            if (args[1].toLowerCase() === "enable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.state": true });
                return message.confirmation("Message filtering has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.state": false });
                return message.confirmation("Message filtering has been **disabled**");
            } else {
                return message.error(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        } else if (args[0].toLowerCase() === "zalgo") {
            if (args[1].toLowerCase() === "enable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.zalgo": true });
                return message.confirmation("Zalgo text moderation has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.zalgo": false });
                return message.confirmation("Zalgo text moderation has been **disabled**");
            } else {
                return message.error(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        } else if (args[0].toLowerCase() === "no-invite") {
            if (args[1].toLowerCase() === "enable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_invite": true });
                message.confirmation("Invite filtering has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_invite": false });
                message.confirmation("Invite filtering has been **disabled**");
            } else {
                return message.error(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        } else if (args[0].toLowerCase() === "no-link") {
            if (args[1].toLowerCase() === "enable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_link": true });
                message.confirmation("Link filtering has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_link": false });
                message.confirmation("Link filtering has been **disabled**");
            } else {
                return message.error(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        }
    }
};