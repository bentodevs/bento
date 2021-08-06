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
    slash: {
        enabled: true,
        opts: [{
            name: "server_ip",
            type: "STRING",
            description: "The IP of the server you want to see the status of.",
            required: true
        },
        {
            name: "server_port",
            type: "INTEGER",
            description: "The port of the server you want to see the status of.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // Fetch the status from the R2-D2 API
        const status = await getMinecraftStatus(args[0], args[1]?.trim() ?? 25565);

        // Return an error if the API returned one
        if (status.error)
            return message.errorReply("The requested server isn't online.");

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
        message.reply({ embeds: [embed] });

    },

    run_interaction: async (bot, interaction) => {

        // Fetch the status from the R2-D2 API
        const status = await getMinecraftStatus(interaction.options.get("server_ip").value, interaction.options.get("server_port")?.value ?? 25565);

        // Return an error if the API returned one
        if (status.error)
            return interaction.error("The requested server isn't online.");

        // Get the icon
        const buf = new Buffer.from(status.favicon.split(",")[1], "base64"),
        icon = new MessageAttachment(buf, "img.png");

        // Build the embed
        const embed = new MessageEmbed()
            .attachFiles(icon)
            .setAuthor(`Server Status - ${interaction.options.get("server_ip").value}`, "attachment://img.png")
            .setThumbnail("attachment://img.png")
            .setDescription(`**Status:** ${bot.config.emojis.online} Online\n**Online Players:** ${status.players.online}/${status.players.max}\n\n**MOTD**\n\`\`\`${status.description.removeMinecraftCodes()}\`\`\``)
            .setTimestamp()
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setFooter(`Requested by: ${interaction.user.tag}`);

        // Send the embed
        interaction.reply({ embeds: [embed], ephemeral: true });

    }
};