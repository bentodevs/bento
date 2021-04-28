const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getMedia } = require("../../modules/functions/anilist");

module.exports = {
    info: {
        name: "manga",
        aliases: [],
        usage: "manga [manga title]",
        examples: [
            "manga Chainsaw Man"
        ],
        description: "Search for manga on anilist.co",
        category: "Anime",
        info: null,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the data
        getMedia(args.join(" "), "MANGA").then(data => {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(data.title.romaji, "https://i.imgur.com/3Crs2k9.png", data.siteUrl)
                .setDescription(stripIndents`${data.description.removeHTML()}
                
                [More Info](${data.siteUrl})`)
                .setImage(`https://img.anili.st/media/${data.id}`)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

            // Send the embed
            message.channel.send(embed);
        }).catch((err) => {
            // Send the error message
            message.error(`Something went wrong while fetching the manga: \`${err.message}\``);
        });

    }
};