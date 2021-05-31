const punishments = require("../database/models/punishments");
const settings = require("../database/models/settings");
const { punishmentLog } = require("../modules/functions/moderation");

module.exports = async (bot, guild, user) => {
    
    const sets = await settings.findOne({ _id: guild.id });

    if (sets.manual_events.moderation) {
        const entry = await guild.fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" }).then(a => a.entries.first());

        if (entry.executor.id === bot.user.id)
            return;

        const action = await punishments.countDocuments({ guild: guild.id }) + 1 || 1,
        member = guild.members.cache.get(entry.executor.id),
        message = {
            author: entry.executor,
            member: member,
            guild: guild,
            settings: sets
        };
    
        // Create the punishment record in the DB
        await punishments.create({
            id: action,
            guild: guild.id,
            type: "unban",
            user: entry.target.id,
            moderator: entry.executor.id,
            actionTime: Date.now(),
            reason: "Manual unban"
        })
    
        // Log the unban
        punishmentLog(message, entry.target, action, "Manual unban", "unban");
    }
}