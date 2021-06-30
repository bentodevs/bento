const config = require("../config");
const settings = require("../database/models/settings");

module.exports = async (bot, guild) => {

    // If there are no guild settings, then create them for the guild
    if (!await settings.findOne({ _id: guild.id })) {
        await new settings({ _id: guild.id }).save();
    }
    
    // Get the joins guild and channel
    const g = bot.guilds.cache.get(config.logging.joinleave.guild) || await bot.guilds.fetch(config.logging.joinleave.guild).catch(() => { }),
        channel = g?.channels.cache.get(config.logging.joinleave.channel);
    
    // Send guild joined message
    channel.send(`:wave: Joined guild \`${guild.name}\` (\`${guild.id}\`)`);
};