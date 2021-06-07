const { MessageEmbed, MessageAttachment } = require("discord.js");
const { getMinecraftStatus } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "mcstatus",
        aliases: [
            "minecraftstatus",
            "serverstatus"
        ],
        usage: "mcstatus <ip> [port]",
        examples: [
            "mcstatus play.starcade.org",
            "mcstatus play.hypixel.net"
        ],
        description: "Get the status of a minecraft server.",
        category: "Games",
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
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Fetch the status from the R2-D2 API
        const status = await getMinecraftStatus(args[0], args[1]?.trim() ?? 25565);

        // Return an error if the API returned one
        if (status.error)
            return message.error("The requested server isn't online.");

        // Get the icon
        const buf = new Buffer.from(status.favicon.split(",")[1], "base64"),
        icon = new MessageAttachment(buf, "img.png");

        // Build the embed
        const embed = new MessageEmbed()
            .attachFiles(icon)
            .setAuthor(`Server Status - ${args[0]}`, "attachment://img.png")
            .setThumbnail("attachment://img.png")
            .setDescription(`**Status:** ${bot.config.emojis.online} Online\n**Online Players:** ${status.players.online}/${status.players.max}\n\n**MOTD**\n\`\`\`${status.description.removeMinecraftCodes()}\`\`\``)
            .setTimestamp()
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setFooter(`Requested by: ${message.author.tag}`);

        // Send the embed
        message.channel.send(embed);

    }
};