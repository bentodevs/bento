import punishments from '../database/models/punishments.js';
import settings from '../database/models/settings.js';
import { punishmentLog } from '../modules/functions/moderation.js';

export default async (bot, guild, user) => {
    // Fetch the guild settings
    const sets = await settings.findOne({ _id: guild.id });

    if (sets?.manual_events?.moderation) {
        // Fetch latest Audit Log entry
        const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then((a) => a.entries.first());

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
        const reason = entry.reason || 'No reason provided';

        // Create the punishment record in the DB
        await punishments.create({
            id: action,
            guild: guild.id,
            type: 'ban',
            user: entry.target.id,
            moderator: entry.executor.id,
            actionTime: Date.now(),
            reason,
        });

        // Log the unban
        const embed = punishmentLog(bot, message, entry.target, action, reason, 'ban');

        // Send public unban log message, if it exists
        guild.channels.fetch(sets.logs?.ban).then((channel) => {
            channel?.send(`${bot.config.emojis.bans} **${entry.target.tag}** was banned for **${reason}**`);
        }).catch(async (err) => {
            if (sets.logs?.ban && err.httpStatus === 404) {
                await settings.findOneAndUpdate({ _id: guild.id }, { 'logs.ban': null });
            } else if (sets.logs?.ban) {
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
