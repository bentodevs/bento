import punishments from '../database/models/punishments.js';
import settings from '../database/models/settings.js';
import { punishmentLog } from '../modules/functions/moderation.js';

export default async (bot, guild) => {
    // Fetch the guild settings
    const sets = await settings.findOne({ _id: guild.id });

    // Event logging
    if (sets?.manual_events?.moderation) {
        // Fetch latest Audit Log entry
        const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_REMOVE' }).then((a) => a.entries.first());

        // If the executor is us, then return
        if (entry.executor.id === bot.user.id) return;

        // 1. Get the punishment ID
        // 2. Get the member who executed the punishment
        // 3. Build a message object so we can use it in the punishmentLog function
        const action = await punishments.countDocuments({ guild: guild.id }) + 1 || 1;
        const member = guild.members.cache.get(entry.executor.id);
        const message = {
            author: entry.executor,
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
        const embed = punishmentLog(bot, message, entry.target, action, 'Manual unban', 'unban');

        // Send public unban log message, if it exists
        guild.channels.fetch(sets.logs?.unban).then((channel) => {
            channel?.send(`${bot.config.emojis.unban} **${entry.target.tag}** was unbanned for **No reason specified**`);
        }).catch(async (err) => {
            if (sets.logs?.unban && err.httpStatus === 404) {
                await settings.findOneAndUpdate({ _id: guild.id }, { 'logs.unban': null });
            } else if (sets.logs?.unban) {
                bot.logger.error(err.stack);
            }
        });

        // Send the punishment to the mod log channel
        guild.channels.fetch(sets.logs?.default).then((channel) => {
            channel?.send({ embeds: [embed] });
        }).catch(async (err) => {
            if (sets.logs?.default && err.httpStatus === 404) {
                await settings.findOneAndUpdate({ _id: guild.id }, { 'logs.default': null });
            } else if (sets.logs?.default) {
                bot.logger.error(err.stack);
            }
        });
    }
};
