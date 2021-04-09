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
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message) => {

        // Fetch a random dog image and convert the response into json
        const req = await fetch("https://dog.ceo/api/breeds/image/random"),
        res = await req.json();

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(res.message)
            .setColor(message.member.displayColor ? message.member.displayHexColor : "#ABCDEF");

        // Send the embed
        message.channel.send(embed);

    }
};