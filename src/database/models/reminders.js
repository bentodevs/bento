import mongoose from 'mongoose';

const reminders = mongoose.model('reminders', new mongoose.Schema({
    _id: String, // The Discord ID of the user
    reminders: Array, // The array of reminders
}));

export default reminders;
