const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getCharacter } = require("../../modules/functions/anilist");

module.exports = {
    info: {
        name: "character",
        aliases: [],
        usage: "character [name]",
        examples: [
            "character Elaina"
        ],
        description: "Search for an anime character on anilist.co",
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

        getCharacter(args.join(" ")).then(data => {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`${data.name.first ?? ""} ${data.name.last ?? ""}`, "https://i.imgur.com/3Crs2k9.png", data.siteUrl)
                .setDescription(stripIndents`${data.description.removeHTML().convertMarkdown()}
                
                [More Info](${data.siteUrl})`)
                .setThumbnail(data.image?.large)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

            // Send the embed
            message.channel.send(embed);
        }).catch(err => {
            // Send the error message
            message.error(`Something went wrong while fetching the character: \`${err.message}\``);
        });

    }
};