const { stripIndents } = require("common-tags");
const { formatDistance } = require("date-fns");
const { MessageEmbed, version } = require("discord.js");
const { connection } = require("mongoose");
const os = require("os");

module.exports = {
    info: {
        name: "botstats",
        aliases: ["uptime", "status"],
        usage: "botstats",
        examples: [],
        description: "Get information about the bot",
        category: "Utility",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message) => {

        // Fetch the bot uptime
        const botUptime = formatDistance(0, bot.uptime),
            sysUptime = formatDistance(0, os.uptime() * 1000);

        // Create the embed
        const embed = new MessageEmbed()
            .setAuthor(`R2-D2 v${bot.config.general.version}`, bot.user.displayAvatarURL({ format: "png", dynamic: true }))
            .setColor(message.member.displayHexColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`Developers: ${bot.config.emojis.jarno} \`Jarno#0001\` and ${bot.config.emojis.waitrose} \`Waitrose#0001\`
            Bot Uptime: **${botUptime}** | System Uptime: **${sysUptime}**
            Database State: ${connection.readyState === 1 ? "<:online:807238910752325662> Healthy" : "<:dnd:807239468448088085> Unhealthy"}
            Commands: **${bot.commands.size}**
            
            Memory Usage: **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(require("os").totalmem() / 1024 / 1024) > 1024 ? `${(require("os").totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB` : `${(require("os").totalmem() / 1024 / 1024).toFixed(2)}`}** | Ping: **${bot.ws.ping}ms**
            **${bot.guilds.cache.size}** servers | **${bot.channels.cache.size.toLocaleString()}** channels | **${bot.users.cache.size.toLocaleString()}** users 
            
            **Dependencies**
            <:djs:773324175979839559> Discord.js: **v${version}** | <:nodejs:773324163867082773> Node.js: **${process.version}**`);
        
        message.channel.send(embed);
    }
};