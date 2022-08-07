import { Snowflake } from 'discord.js';

export type Reminder = {
    id: number;
    text: string;
    timestamps: {
        created: number;
        remindAt: number;
    },
    pending: boolean;
};

export type PunishmentType = 'BAN' | 'UNBAN' | 'MUTE' | 'UNMUTE' | 'KICK';
