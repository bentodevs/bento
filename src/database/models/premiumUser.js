import mongoose from 'mongoose';

const premiumUser = mongoose.model('premiumUser', new mongoose.Schema({
    _id: String, // The user ID
    premiumCount: Number, // Number of servers the user can have as premium at any time
    servers: Array, // Array of servers that have premium, and their expiry time
}));

export default premiumUser;
