const { model, Schema } = require("mongoose");

module.exports = model("preban", new Schema({
    user: String,
    guild: String,
    reason: String,
    executor: String
}));