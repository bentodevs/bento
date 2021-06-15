const punishments = require("../database/models/punishments");
const settings = require("../database/models/settings");
const { punishmentLog } = require("../modules/functions/moderation");

module.exports = async (bot, guild, user) => {
    
    // Fetch the guild settings
    const sets = await settings.findOne({ _id: guild.id });

    if (sets?.manual_events?.moderation) {
        // Fetch latest Audit Log entry
        const entry = await guild.fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" }).then(a => a.entries.first());

        // If the executor is us, then return
        if (entry.executor.id === bot.user.id)
            return;

        // 1. Get the punishment ID
        // 2. Get the member who executed the punishment
        // 3. Build a message object so we can use it in the punishmentLog function
        const action = await punishments.countDocuments({ guild: guild.id }) + 1 || 1,
            member = guild.members.cache.get(entry.executor.id),
            message = {
                author: entry.executor,
                member: member,
                guild: guild,
                settings: sets
            },
            reason = entry.reason || "No reason provided";
    
        // Create the punishment record in the DB
        await punishments.create({
            id: action,
            guild: guild.id,
            type: "ban",
            user: entry.target.id,
            moderator: entry.executor.id,
            actionTime: Date.now(),
            reason: reason
        });
    
        // Log the unban
        punishmentLog(message, entry.target, action, reason, "ban");
    }
};