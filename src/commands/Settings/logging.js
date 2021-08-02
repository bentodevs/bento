const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const config = require("../../config");
const settings = require("../../database/models/settings");

module.exports = {
    info: {
        name: "logging",
        aliases: [],
        usage: "logging [setting] [option]",
        examples: [
            "logging moderation #mod-logs",
            "logging channels disable"
        ],
        description: "Change or view event logging settings.",
        category: "Settings",
        info: null,
        options: [
            "`moderation` - Logs manual moderation actions (Such as kicks & bans)",
            "`guild` - Logs server-level changes (Server name, icon, etc.)",
            "`channels` - Logs channel modifications, removals and additions",
            "`roles` - Logs role modifications, removals and additions",
            "`members` - Logs user chanes (Profile pictures, etc.), leaves and joins"
        ]
    },
    perms: {
        permission: "ADMISTRATOR",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {
        
        if (args[0]?.toLowerCase() === "moderation") {
            if (message.settings.manual_events.moderation) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.moderation": false });
                message.confirmationReply("Manual moderation logging has been **disabled**");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.moderation": true });
                message.confirmationReply("Manual moderation logging has been **enabled**");
            }
        } else if (args[0]?.toLowerCase() === "guild") {
            if (message.settings.manual_events.guild) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.guild": false });
                message.confirmationReply("Guild modification logging has been **disabled**");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.guild": true });
                message.confirmationReply("Guild modification logging has been ***enabled**");
            }
        } else if (args[0]?.toLowerCase() === "channels") {
            if (message.settings.manual_events.channels) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.channels": false });
                message.confirmationReply("Channel modification logging has been **disabled**");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.channels": true });
                message.confirmationReply("Channel modification logging has been **enabled**");
            }
        } else if (args[0]?.toLowerCase() === "roles") {
            if (message.settings.manual_events.roles) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.roles": false });
                message.confirmationReply("Manual role modification event logging has been **disabled**");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.roles": true });
                message.confirmationReply("Manual role modification event logging has been **enabled**");
            }
        } else if (args[0]?.toLowerCase() === "members") {
            if (message.settings.manual_events.members) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.members": false });
                message.confirmationReply("Member modification logging has been **disabled**");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.members": true });
                message.confirmationReply("Member modification logging has been **enabled**");
            }
        } else {
            const embed = new MessageEmbed()
                .setTitle(`Event logging`)
                .setColor(message.member.displayColor ?? bot.config.general.embedColor)
                .setThumbnail("https://i.imgur.com/iML7LKF.png")
                .setDescription(stripIndents`⚒️ Manual moderation logging is ${message.settings.manual_events.moderation ? "**enabled**" : "**disabled**"}
                    🖥️ Guild modification logging is ${message.settings.manual_events.guild ? "**enabled**" : "**disabled**"}
                    ${config.emojis.channel} Channel modification logging is ${message.settings.manual_events.channels ? "**enabled**" : "**disabled**"}
                    📚 Role modification logging is ${message.settings.manual_events.roles ? "**enabled**" : "**disabled**"}
                    🧑‍🤝‍🧑 Member modification logging is ${message.settings.manual_events.members ? "**enabled**" : "**disabled**"}`);
            
            message.channel.send({ embeds: [embed] });
        }
    }
};