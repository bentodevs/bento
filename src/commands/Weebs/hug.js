const { MessageEmbed } = require("discord.js");
const { getMember } = require("../../modules/functions/getters");
const { fetchWaifuApi } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "hug",
        aliases: [],
        usage: "hug [member]",
        examples: [
            "hug @Jarno"
        ],
        description: "Sends a GIF of an anime character getting hugged.",
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
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Fetch the image
        const URL = await fetchWaifuApi("hug"),
        member = await getMember(message, args.join(" "), true);

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);
        
        // Send the embed
        message.channel.send(`${member} got hugged`, embed);

    }
};