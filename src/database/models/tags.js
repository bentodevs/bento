const { model, Schema } = require("mongoose");

module.exports = model("tags", new Schema({
    guild: String, // The Guild ID
    name: String, // The name of the tag
    content: String, // The content of the tag
    lastModified: Number // Timestamp the tag was last modified at
}));