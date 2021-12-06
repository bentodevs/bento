import mongoose from 'mongoose';

const preban = mongoose.model('preban', new mongoose.Schema({
    user: String,
    guild: String,
    reason: String,
    executor: String,
}));

export default preban;
