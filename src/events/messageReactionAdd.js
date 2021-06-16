const giveaways = require("../database/models/giveaways");

module.exports = async (bot, reaction, user) => {
    // If the reaction or user are partial try to fetch them
    if (reaction.partial || user.partial) {
        try {
            await reaction.fetch();
            await user.fetch();
        } catch (err) {
            return bot.logger.error(err);
        }
    }

    // If the user is a bot ignore the reaction
    if (user.bot)
        return;
    // If the reaction isn't in a guild ignore the reaction
    if (!reaction.message.guild)
        return;

    // Check if the reaction message is a giveaway message
    const giveaway = await giveaways.findOne({ "guild.message_id": reaction.message.id, active: true });

    // If the reaction is a giveaway message add the users reaction to the entries
    if (giveaway) {
        await giveaways.findOneAndUpdate({ "guild.message_id": reaction.message.id, active: true }, {
            $addToSet: {
                entries: user.id
            }
        });
    }
};