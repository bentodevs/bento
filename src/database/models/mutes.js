import mongoose from 'mongoose';

const mutes = mongoose.model('mutes', new mongoose.Schema({
    guild: String, // The ID the mute exists in
    mutedUser: String, // The ID of the muted user
    muteTime: String, // The length of the mute
    mutedBy: String, // The ID of the user that issued the mute
    timeMuted: Number, // The timestamp of the mute
    reason: String, // The reason for the mute
    caseID: Number, // The case number of the punishment
}));

export default mutes;
