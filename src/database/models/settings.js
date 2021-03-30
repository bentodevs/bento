const { model, Schema } = require("mongoose");
const config = require("../../config");

module.exports = model("settings", new Schema({
    _id: String, // Discord Guild ID
    general: {
        type: Object,
        default: {
            prefix: config.general.prefix // Bot Prefix
        }
    }
}));