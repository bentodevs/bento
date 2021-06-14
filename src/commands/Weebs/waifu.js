const { MessageEmbed } = require("discord.js");
const { fetchWaifuApi } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "waifu",
        aliases: [],
        usage: "",
        examples: [],
        description: "Fetches a random waifu image from the waifu.pics API.",
        category: "Weebs",
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
        enabled: true,
        opts: []
    },

    run: async (bot, message) => {

        // Fetch the image
        const URL = await fetchWaifuApi("waifu");

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        message.reply({ embeds: [embed] });

    }
};