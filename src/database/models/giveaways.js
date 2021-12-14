import mongoose from 'mongoose';

const giveaways = mongoose.model('giveaways', new mongoose.Schema({
    id: Number, // The Giveaway ID
    guild: {
        guild_id: String, // The Guild ID
        message_id: String, // The Giveaway Message ID
        channel_id: String, // The Giveaway Channel ID
    },
    creator: String, // The User ID of the Giveaway creator
    winners: Number, // The amount of winners the giveaway will have
    prize: String, // The name of the giveaway prize
    entries: Array, // An array with the giveaway entries
    timestamps: {
        start: Number, // The start time of the giveaway
        ends: Number, // The end time of the giveaway
        length: Number, // The length of the giveaway
    },
    active: Boolean, // Wether the giveaway is active or not
}));

export default giveaways;
