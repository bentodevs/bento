const { model, Schema } = require('mongoose');

module.exports = model('reminders', new Schema({
    _id: String, // The Discord ID of the user
    reminders: Array, // The array of reminders
}));
