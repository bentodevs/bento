import { model, Schema } from 'mongoose';
import { ISettings } from '../../modules/interfaces/db';

const settingsSchema = new Schema<ISettings>({
    _id: { type: String },
    general: {
        timezone: { type: String, default: 'Europe/London' },
        disabled_categories: [{ type: String }],
        disabled_commands: [{ type: String }],
    },
    welcome: {
        channel: { type: String || null, default: '' },
        joinMessage: { type: String || null, default: '' },
        leaveMessage: { type: String || null, default: '' },
        userMessage: { type: String || null, default: '' },
    },
    roles: [{ type: String }],
    moderation: {
        minimumAge: { type: String || null, default: '' },
        allowBots: { type: Boolean, default: true },
    },
    blacklist: {
        users: [{ type: String }],
        roles: [{ type: String }],
        bypassHierachicRole: { type: String, required: false },
        bypassRoles: [{ type: String }],
    },
    logs: {
        commands: {
            enabled: { type: Boolean, default: false },
            channel: { type: String || null, default: '' },
        },
        punishments: {
            enabled: { type: Boolean, default: false },
            trackManual: { type: Boolean, default: true },
            channel: { type: String || null, default: '' },
        },
        guild: {
            enabled: { type: Boolean, default: false },
            channel: { type: String || null, default: '' },
        },
        channels: {
            enabled: { type: Boolean, default: false },
            channel: { type: String || null, default: '' },
        },
        roles: {
            enabled: { type: Boolean, default: false },
            trackManual: { type: Boolean, default: true },
            channel: { type: String || null, default: '' },
        },
        members: {
            enabled: { type: Boolean, default: false },
            channel: { type: String || null, default: '' },
        },
    },

});

const settings = model<ISettings>('settings', settingsSchema);

export default settings;
