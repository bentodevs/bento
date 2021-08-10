const { MessageEmbed } = require("discord.js");
const { default: fetch } = require("node-fetch");

module.exports = {
    info: {
        name: "shibe",
        aliases: [],
        usage: "",
        examples: [],
        description: "Get a random image of a shibe (dog).",
        category: "Fun",
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

        // Fetch a random shibe image and convert the response into json
        const req = await fetch("http://shibe.online/api/shibes"),
        res = await req.json();

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(res[0])
            .setColor(message.member?.displayColor || bot.config.general.embedColor);

        // Send the embed
        message.reply({ embeds: [embed] });

    }
};