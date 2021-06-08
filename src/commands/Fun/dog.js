const { MessageEmbed } = require("discord.js");
const { default: fetch } = require("node-fetch");

module.exports = {
    info: {
        name: "dog",
        aliases: ["doge", "doggo"],
        usage: "",
        examples: [],
        description: "Get a random image of a dog.",
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

        // Fetch a random dog image and convert the response into json
        const req = await fetch("https://random.dog/woof.json"),
        res = await req.json();

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(res.url)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        message.reply(embed);

    }
};