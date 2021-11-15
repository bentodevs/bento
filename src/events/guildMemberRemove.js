const { getSettings } = require('../database/mongo');

module.exports = async (bot, member) => {
    // If the member is a partial fetch it
    if (member.partial) {
        try {
            await member.fetch();
        } catch (err) {
            return bot.logger.error(err);
        }
    }

    // Grab the settings
    const settings = await getSettings(member.guild.id);

    // Get the welcome channel
    const welcomeChannel = member.guild.channels.cache.get(settings.welcome.channel);

    // If the welcome channel exists and there is a message set in the DB, then send it
    if (welcomeChannel && settings.welcome.leaveMessage) {
        const msg = settings.welcome.leaveMessage
            .replace('{id}', member.user.id)
            .replace('{tag}', member.user.tag)
            .replace('{member}', member)
            .replace('{server}', member.guild.name)
            .replace('{count}', await member.guild.members.fetch().then((a) => a.size));

        welcomeChannel.send(msg);
    }
};
