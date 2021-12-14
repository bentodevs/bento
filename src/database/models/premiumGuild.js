import mongoose from 'mongoose';

const premiumGuild = mongoose.model('premiumGuild', new mongoose.Schema({
    _id: String, // The Guild ID
    active: Boolean,
    activatedBy: String,
    expiry: String,
}));

export default premiumGuild;
