const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "mojang",
        aliases: ["mcstatus", "mojangstatus", "minecraftstatus"],
        usage: "",
        examples: [],
        description: "Displays the current status of Mojang services.",
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
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message) => {

        // Define the different mojang statuses
        const status = {
            red: bot.config.emojis.dnd,
            yellow: bot.config.emojis.idle,
            green: bot.config.emojis.online
        };

        // Define the description
        let desc = "";

        // Loop through the mojang statuses and add them to the description
        bot.mojang.status.forEach(element => {
            Object.keys(element).forEach((key) => {
                desc += `**${key}:** ${status[element[key]]}\n`;
            });
        });

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor("Mojang Status", "https://i.imgur.com/U6QKany.jpg")
            .setDescription(desc)
            .setColor("#EF2E3A")
            .setThumbnail("https://i.imgur.com/IX82cRp.png")
            .setFooter("Last Updated")
            .setTimestamp(bot.mojang.lastUpdated);

        // Send the embed
        message.reply({ embeds: [embed] });

    }
};