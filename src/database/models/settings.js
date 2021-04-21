const { model, Schema } = require("mongoose");
const config = require("../../config");

module.exports = model("settings", new Schema({
    _id: String, // Discord Guild ID
    general: {
        type: Object,
        default: {
            prefix: config.general.prefix // Bot Prefix
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
    }
}));