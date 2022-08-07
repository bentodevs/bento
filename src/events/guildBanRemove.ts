import {
    AuditLogEvent, Client, Guild, GuildAuditLogs, GuildTextBasedChannel,
} from 'discord.js';
import punishments from '../database/models/punishments.js';
import settings from '../database/models/settings.js';
import logger from '../logger';
import { punishmentLog } from '../modules/functions/moderation.js';

export default async (bot: Client, guild: Guild) => {
    // Fetch the guild settings
    const sets = await settings.findOne({ _id: guild.id });

    // Event logging
    if (sets?.logs?.punishments.enabled && sets.logs.punishments.channel) {
        // Fetch latest Audit Log entry
        const entry = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove }).then((a) => a.entries.first());

        // If the executor is us, then return
        if (entry?.executor!.id === bot?.user!.id) return logger.debug(`Not logging ${entry.actionType} as it was performed by the Client.`);
        if (!entry?.executor || !entry?.target) return logger.debug(`Not logging ${entry?.actionType} as it does not contain an executor and/or target.`);

        // 1. Get the punishment ID
        // 2. Get the member who executed the punishment
        // 3. Build a message object so we can use it in the punishmentLog function
        const action = await punishments.countDocuments({ guild: guild.id }) + 1 || 1;
        const member = guild.members.cache.get(entry.executor.id);
        const message = {
            user: entry.executor,
            member,
            guild,
            settings: sets,
        };

        // Create the punishment record in the DB
        await punishments.create({
            id: action,
            guild: guild.id,
            type: 'unban',
            user: entry.target.id,
            moderator: entry.executor.id,
            actionTime: Date.now(),
            reason: 'Manual unban',
        });

        // Log the unban
        const embed = punishmentLog(bot, message, entry.target, action, 'Manual unban', 'UNBAN');

        // Send the punishment to the mod log channel
        guild.channels.fetch(sets.logs.punishments.channel).then((channel) => {
            (channel as GuildTextBasedChannel)?.send({ embeds: [embed] });
        }).catch(async (err) => {
            if (sets.logs.punishments.channel && err.httpStatus === 404) {
                await settings.findOneAndUpdate({ _id: guild.id }, { 'logs.punishments.channel': null });
            } else if (sets.logs.punishments.channel) {
                logger.log('error', `Failed to send ${entry.actionType} log channel`, err);
            }
        });
    }
};
