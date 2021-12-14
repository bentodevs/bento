import mongoose from 'mongoose';

const permissions = mongoose.model('permissions', new mongoose.Schema({
    _id: String, // Discord Guild ID
    permissions: {
        type: Object,
        default: {
            commands: {}, // Command Permissions
            categories: {}, // Category Permissions
        },
    },
}));

export default permissions;
