const config = require("../config");

module.exports = async (bot, guild) => {
    
    // Get the joins guild and channel
    const g = bot.guilds.cache.get(config.logging.joinleave.guild) || await bot.guilds.fetch(config.logging.joinleave.guild).catch(() => { }),
        channel = g?.channels.cache.get(config.logging.joinleave.channel);
    
    // Send guild joined message
    channel.send(`:wave: Joined guild \`${guild.name}\` (\`${guild.id}\`)`);
};