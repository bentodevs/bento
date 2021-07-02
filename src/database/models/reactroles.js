const { model, Schema } = require("mongoose");

module.exports = model("reactroles", new Schema({
    guild: String, // The guild the message is in
    message: String, // The message ID
    channel: String, // The channel the message is in
    roles: Array // The array of roles
}));