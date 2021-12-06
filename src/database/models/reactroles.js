import mongoose from 'mongoose';

const reactRoles = mongoose.model('reactroles', new mongoose.Schema({
    guild: String, // The guild the message is in
    message: String, // The message ID
    channel: String, // The channel the message is in
    roles: Array, // The array of roles
}));

export default reactRoles;
