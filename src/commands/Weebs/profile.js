const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getProfile } = require("../../modules/functions/anilist");

module.exports = {
    info: {
        name: "profile",
        aliases: [],
        usage: "profile [username]",
        examples: [
            "profile Jarnoo"
        ],
        description: "Get a users anilist profile.",
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
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        getProfile(args.join(" ")).then(data => {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(data.name, "https://i.imgur.com/3Crs2k9.png", data.siteUrl)
                .setDescription(stripIndents`Name: **${data.name}**
                ID: **${data.id}**${data.donatorTier ? `\nDonator Tier: **${data.donatorTier}**` : ""}${data.donatorBadge && data.donatorTier ? `\nDonator Badge: **${data.donatorBadge}**` : ""}
                More Info: [Click Here](${data.siteUrl})`)
                .addField("Anime", stripIndents`Anime Watched: **${data.statistics.anime.count}**
                Episodes Watched: **${data.statistics.anime.episodesWatched}**
                Days Watched: **${(data.statistics.anime.minutesWatched / 1440).toFixed(1)}**
                Mean Score: **${data.statistics.anime.meanScore}**`, true)
                .addField("Manga", stripIndents`Manga Read: **${data.statistics.manga.count}**
                Chapters Read: **${data.statistics.manga.chaptersRead}**
                Volumes Read: **${data.statistics.manga.volumesRead}**
                Mean Score: **${data.statistics.manga.meanScore}**`, true)
                .setThumbnail(data.avatar.large)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

            // Send the embed
            message.channel.send(embed);
        }).catch(err => {
            // Send the error message
            message.error(`Something went wrong while fetching the character: \`${err.message}\``);
        });

    }
};