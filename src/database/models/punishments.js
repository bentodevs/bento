import mongoose from 'mongoose';

const punishments = mongoose.model('punishments', new mongoose.Schema({
    id: String, // The ID of the punishment
    guild: String, // The Guild ID the punishment was executed in
    type: String, // The type of punishment
    user: String, // The user id for who was punished
    moderator: String, // The user id of who executed this punishment
    actionTime: Number, // The timestamp of which this punishment was executed
    reason: String, // The reason provided for the punishment
    muteTime: String, // The length of this mute
}));

export default punishments;
