import mongoose from 'mongoose';

const users = mongoose.model('users', new mongoose.Schema({
    _id: String, // The user ID
    track: {
        type: Object,
        default: {
            usernames: true, // If the bot should track the users usernames
        },
    },
    usernames: Array, // Previous usernames of the user
    guilds: Array, // Array with guilds with the users data for those guilds
    lastfm: String, // The user's Last.fm username
}));

export default users;
