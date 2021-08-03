const { model, Schema } = require("mongoose");
const config = require("../../config");

module.exports = model("settings", new Schema({
    _id: String, // Discord Guild ID
    general: {
        type: Object,
        default: {
            prefix: config.general.prefix, // Bot Prefix
            premium: false, // Whether the guild is a premium guild or not
            timezone: "UTC", // The timezone of the bot
            disabled_categories: [], // List of disabled command categories
            disabled_commands: [], // List of disabled commands
            command_channel: null, // Auto-clearing command channel
            permission_message: true, // Whether the bot sends permission messages or not
            permission_dms: true, // Wether the bot sends permission dms or not
            disabled_message: true, // Wether the bot sends "command/category is disabled" messages or not
            restricted_channels: [] // An array with restricted channels
        }
    },
    welcome: {
        type: Object,
        default: {
            channel: null, // The channel to send the joinMessage to
            joinMessage: null, // The message to send when a user joins the guild
            leaveMessage: null, // The message to send when a user leaves the guild
            userMessage: null // The message to send to the user when they join the guild
        }
    },
    roles: {
        type: Object,
        default: {
            auto: [], // The array of role IDs that should be applied by autorole
            mute: null // The mute role ID
        }
    },
    moderation: {
        type: Object,
        default: {
            minimumAge: null, // The minimum age length to check against for new accounts
            bots: false, // Whether bots can join the guild
            filter: {
                state: false, // If the filter is enabled or not
                zalgo: false, // If zalgo text needs to be filtered
                entries: [] // Array of filter entries
            },
            no_invite: false, // If users are allowed to send invites or not
            no_link: false, // If users are allowed to send links or not
            mentions_mute: null, // Amount of mentions needed for a mute
            mentions_ban: null // Amount of mentions needed for a ban
        }
    },
    ignore: {
        type: Object,
        default: {
            hierarchicRoleId: null, // Lowest role in list where all roles above can bypass the automod
            roles: [], // Array of roles that can bypass the automod
            channels: [] // Array of channels that can bypass the automod
        }
    },
    blacklist: {
        type: Object,
        default: {
            users: [], // Array of blacklisted users
            roles: [], // Array of blacklisted roles
            channels: [], // Array of blacklisted channels
            bypass: {
                roles: [], // Array of roles that bypass the blacklist
                hierarchicRoleId: null // Lowest role in list where all roles above can bypass blacklist
            }
        }
    },
    logs: {
        type: Object,
        default: {
            default: null, // Default logging channel
            commands: null, // Command logging channel
            edited: null, // Edited messages logging channel
            deleted: null, // Deleted messages logging channel
            events: null // Event logging channel
        }
    },
    manual_events: {
        type: Object,
        default: {
            moderation: false, // Wether or not moderation actions get logged
            guild: false, // Wether or not guild actions get logged
            channels: false, // Wether or not channel actions get logged
            roles: false, // Wether or not role actions get logged
            members: false // Wether or not member actions get logged
        }
    },
    leveling: {
        type: Object,
        default: {
            messages: true, // Wether the bot should send level up messages or not
            multiplier: 1.0 // The XP multiplier for levels
        }
    },
    changelogs: {
        type: Object,
        default: {
            channel: null,
            locations: []
        }
    }
}));