const { MessageEmbed, MessageAttachment } = require("discord.js");
const { default: fetch } = require("node-fetch");

module.exports = {
    info: {
        name: "cat",
        aliases: ["cate"],
        usage: "",
        examples: [],
        description: "Get a random image of a cat.",
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

        // Fetch a random cat image and convert the response into a buffer
        const req = await fetch("https://cataas.com/cat"),
        buffer = await req.buffer();

        // Build the embed
        const embed = new MessageEmbed()
            .setImage("attachment://cat.png")
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        message.reply({ embeds: [embed], files: [new MessageAttachment(buffer, "cat.png")] });

    }
};