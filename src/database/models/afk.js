import mongoose from 'mongoose';

const afk = mongoose.model('afks', new mongoose.Schema({
    user: String, // The user ID
    guild: String, // The Guild this AFK object is in
    status: String, // The AFK status that the user wishes to have
    ignored: Array, // Array of ignored channels
}));

export default afk;
