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
            // Get the description and remove html tags and markdown
            let description = data.description.removeHTML().convertMarkdown();

            if (description.length >= 2000) {
                // Make the description shorter
                description = description.slice(0, 1975);
                
                // Check how many spoiler tags are in the description
                const spoilers = description.match(/\|\|/g).length;
                
                // If the number of spoilers is even add ... to the description
                // If the number of spoilers isn't even add ...|| to the description to close off the spoiler
                if (spoilers%2 == 0) {
                    description += "...";
                } else {
                    description += "...||";
                }
            }

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(data.title.romaji, "https://i.imgur.com/3Crs2k9.png", data.siteUrl)
                .setDescription(stripIndents`${description}
                
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