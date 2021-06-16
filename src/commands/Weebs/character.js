const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getCharacter } = require("../../modules/functions/anilist");

module.exports = {
    info: {
        name: "character",
        aliases: [],
        usage: "character <name>",
        examples: [
            "character Elaina"
        ],
        description: "Search for an anime character on anilist.co",
        category: "Weebs",
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
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "name",
            type: "STRING",
            description: "The name of the character.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        getCharacter(message.options?.get("name")?.value ?? args.join(" ")).then(data => {
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
                .setAuthor(`${data.name.first ?? ""} ${data.name.last ?? ""}`, "https://i.imgur.com/3Crs2k9.png", data.siteUrl)
                .setDescription(stripIndents`${description}
                
                [More Info](${data.siteUrl})`)
                .setThumbnail(data.image?.large)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

            // Send the embed
            message.reply({ embeds: [embed] });
        }).catch(err => {
            // Send the error message
            message.errorReply(`Something went wrong while fetching the character: \`${err.message}\``);
        });

    }
};