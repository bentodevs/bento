const { model, Schema } = require("mongoose");

module.exports = model("users", new Schema({
    _id: String, // The user ID
    track: {
        type: Object,
        default: {
            usernames: false
        }
    },
    usernames: Array // Previous usernames of the user
}));