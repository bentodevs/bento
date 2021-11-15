const { model, Schema } = require('mongoose');

module.exports = model('premiumGuild', new Schema({
    _id: String, // The Guild ID
    active: Boolean,
    activatedBy: String,
    expiry: String,
}));
