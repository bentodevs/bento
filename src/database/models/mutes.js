const mongo = require('mongoose');

const mutes = new mongo.Schema({
    guild: String, // The ID the mute exists in
    mutedUser: String, // The ID of the muted user
    muteTime: String, // The length of the mute
    mutedBy: String, // The ID of the user that issued the mute
    timeMuted: Number, // The timestamp of the mute
    reason: String, // The reason for the mute
    caseID: Number // The case number of the punishment
});

module.exports = mongo.model('mutes', mutes);