const config = require("../config");

module.exports = async (bot, guild) => {
    // If the guild is not available, then return
    // This typically indicates that there is a server outage
    if (!guild.available)
        return;
    
    // Get the joins guild and channel
    const g = bot.guilds.cache.get(config.logging.joinleave.guild) || await bot.guilds.fetch(config.logging.joinleave.guild).catch(() => { }),
    channel = g?.channels?.cache.get(config.logging.joinleave.channel);
    
    // Send guild joined message
    channel.send(`:door: Left guild \`${guild.name}\` (\`${guild.id}\`)`);
};