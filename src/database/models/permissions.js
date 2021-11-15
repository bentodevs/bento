const { model, Schema } = require('mongoose');

module.exports = model('permissions', new Schema({
    _id: String, // Discord Guild ID
    permissions: {
        type: Object,
        default: {
            commands: {}, // Command Permissions
            categories: {}, // Category Permissions
        },
    },
}));
