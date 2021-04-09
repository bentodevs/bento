const { stripIndents } = require("common-tags");
const { formatDistance } = require("date-fns");
const { MessageEmbed, version } = require("discord.js");
const { connection } = require("mongoose");

module.exports = {
    info: {
        name: "botstats",
        aliases: ["bstats"],
        usage: "",
        examples: [],
        description: "View some statistics and information about the bot.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message) => {

        // Get and format the bot uptime
        const uptime = formatDistance(0, bot.uptime);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`R2-D2 v${bot.config.general.version}`, bot.user.displayAvatarURL({ format: "png", dynamic: true }))
            .setColor(message.member.displayColor ? message.member.displayHexColor : "#ABCDEF")
            .setDescription(stripIndents`Developed By: ${bot.config.emojis.jarno} \`Jarno#0001\` and ${bot.config.emojis.waitrose} \`Waitrose#0001\`
            Uptime: **${uptime}**
            Database State: ${connection.readyState === 1 ? `${bot.config.emojis.online} Healthy` : `${bot.config.emojis.dnd} Unhealthy`}
            Commands: **${bot.commands.size}**
            
            Memory Usage: **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(require("os").totalmem() / 1024 / 1024) > 1024 ? `${(require("os").totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB` : `${(require("os").totalmem() / 1024 / 1024).toFixed(2)}`}** | Ping: **${bot.ws.ping}ms**
            **${bot.guilds.cache.size.toLocaleString()}** servers | **${bot.channels.cache.size.toLocaleString()}** channels | **${bot.users.cache.size.toLocaleString()}** users
            
            **Dependencies**
            ${bot.config.emojis.djs} Discord.js **v${version}** | ${bot.config.emojis.nodejs} Node.js **${process.version}**`);

        // Send the embed
        message.channel.send(embed);
        
    }
};