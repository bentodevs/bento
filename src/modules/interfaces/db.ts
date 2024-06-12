import { Snowflake } from 'discord.js';
import { PunishmentType, Reminder } from '../../types/dbTypes';

export interface ISettings {
    _id: Snowflake,
    isPremium: boolean,
    general: {
        sendCmdCatDisabledMsgs: boolean;
        sendPermissionDMs: boolean;
        timezone: string,
        disabledCategories: Array<string>,
        disabledCommands: Array<string>,
    },
    welcome: {
        channel: Snowflake | null,
        joinMessage: string | null,
        leaveMessage: string | null,
        userMessage: string | null,
    },
    roles: Array<Snowflake>,
    moderation: {
        minimumAge: string | null,
        allowBots: boolean,
    },
    blacklist: {
        users: Array<Snowflake>,
        roles: Array<Snowflake>,
        bypassHierachicRole: Snowflake,
        bypassRoles: Array<Snowflake>
    },
    logs: {
        commands: {
            enabled: boolean,
            channel: Snowflake | null,
        },
        punishments: {
            enabled: boolean,
            trackManual: boolean,
            channel: Snowflake | null,
        },
        guild: {
            enabled: boolean,
            channel: Snowflake | null,
        },
        channels: {
            enabled: boolean,
            channel: Snowflake | null,
        },
        roles: {
            enabled: boolean,
            trackManual: boolean,
            channel: Snowflake | null,
        },
        members: {
            enabled: boolean,
            channel: Snowflake | null,
        }
    }
}

export interface IGiveaways {
    id: number,
    guild: {
        guildId: Snowflake,
        messageId: Snowflake,
        channelId: Snowflake
    },
    creator: Snowflake,
    winners: number,
    prize: string,
    entries: Array<Snowflake>,
    timestamps: {
        start: number,
        end: number,
        length: number
    },
    active: boolean
}

export interface IMutes {
    guildId: Snowflake,
    mutedId: Snowflake,
    timestamps: {
        start: number,
        length: number,
    },
    reason: string,
    caseId: number
}

export interface IPrebans {
    userId: Snowflake,
    guildId: Snowflake,
    reason: string,
    executor: Snowflake
}

export interface IPremiumGuild {
    paypalId: string,
    discordId: Snowflake,
    guilds: Array<Snowflake>,
    expiry: number,
}

export interface IPunishments {
    id: number,
    guildId: Snowflake,
    type: PunishmentType,
    userId: Snowflake,
    executorId: Snowflake,
    actionTime: number,
    reason: string,
    muteTime: number | null,
}

export interface IReactRoles {
    guildId: Snowflake,
    messageId: Snowflake,
    channelId: Snowflake,
    roleIds: Array<RoleMapping>
}

export interface IUsers {
    _id: Snowflake,
    accounts: {
        lastfm: string
    }
}

export interface IReminders {
    _id: string,
    reminders: Array<Reminder>
}

type RoleMapping = {
    role: Snowflake,
    emoji: Snowflake
};
