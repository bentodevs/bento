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

        const events = ["moderation", "guild", "channels", "roles", "members"],
            _settings = await settings.findOne({ _id: message.guild.id });
        
        if (args[0].toLowerCase() === "moderation") {
            if (_settings.manual_events.moderation) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.moderation": false });
                message.confirmationReply("Manual moderation event logging has been disabled");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.moderation": true });
                message.confirmationReply("Manual moderation event logging has been enabled");
            }
        } else if (args[0].toLowerCase() === "guild") {
            if (_settings.manual_events.guild) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.guild": false });
                message.confirmationReply("Manual guild modifications event logging has been disabled");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.guild": true });
                message.confirmationReply("Manual guild modifications event logging has been enabled");
            }
        } else if (args[0].toLowerCase() === "channels") {
            if (_settings.manual_events.channels) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.channels": false });
                message.confirmationReply("Manual channel modification event logging has been disabled");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.channels": true });
                message.confirmationReply("Manual channel modification event logging has been enabled");
            }
        } else if (args[0].toLowerCase() === "roles") {
            if (_settings.manual_events.roles) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.roles": false });
                message.confirmationReply("Manual role modification event logging has been disabled");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.roles": true });
                message.confirmationReply("Manual role modification event logging has been enabled");
            }
        } else if (args[0].toLowerCase() === "members") {
            if (_settings.manual_events.members) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.members": false });
                message.confirmationReply("Manual member modification event logging has been disabled");
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "manual_events.members": true });
                message.confirmationReply("Manual member modification event logging has been enabled");
            }
        } else {
            return message.errorReply(`You didn't specify a valid logging option! Valid options are: \`${events.join("`, `")}\``);
        }
    }
};