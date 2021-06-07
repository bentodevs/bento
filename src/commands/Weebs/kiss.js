const { MessageEmbed } = require("discord.js");
const { getMember } = require("../../modules/functions/getters");
const { fetchWaifuApi } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "kiss",
        aliases: [],
        usage: "kiss <member>",
        examples: [
            "kiss @Jarno"
        ],
        description: "Sends a GIF of anime characters kissing.",
        category: "Weebs",
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

        // Fetch the image
        const URL = await fetchWaifuApi("kiss"),
        member = await getMember(message, args.join(" "), true);

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);
        
        // Send the embed
        message.channel.send(`${message.member} kissed ${member}`, embed);

    }
};