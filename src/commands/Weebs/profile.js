import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { getProfile } from '../../modules/functions/anilist.js';

export default {
    info: {
        name: 'profile',
        aliases: [],
        usage: 'profile [username]',
        examples: [
            'profile Jarnoo',
        ],
        description: 'Get a users anilist profile.',
        category: 'Weebs',
        info: null,
        options: [],
    },
    perms: {
        permission: 'ADMINISTRATOR',
        type: 'discord',
        self: [],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'username',
            type: 'STRING',
            description: 'The users anilist username.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        getProfile(message.options?.get('username')?.value ?? args.join(' ')).then((data) => {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor({ name: data.name, iconURL: 'https://i.imgur.com/3Crs2k9.png', url: data.siteUrl })
                .setDescription(stripIndents`Name: **${data.name}**
                ID: **${data.id}**${data.donatorTier ? `\nDonator Tier: **${data.donatorTier}**` : ''}${data.donatorBadge && data.donatorTier ? `\nDonator Badge: **${data.donatorBadge}**` : ''}
                More Info: [Click Here](${data.siteUrl})`)
                .addField('Anime', stripIndents`Anime Watched: **${data.statistics.anime.count}**
                Episodes Watched: **${data.statistics.anime.episodesWatched}**
                Days Watched: **${(data.statistics.anime.minutesWatched / 1440).toFixed(1)}**
                Mean Score: **${data.statistics.anime.meanScore}**`, true)
                .addField('Manga', stripIndents`Manga Read: **${data.statistics.manga.count}**
                Chapters Read: **${data.statistics.manga.chaptersRead}**
                Volumes Read: **${data.statistics.manga.volumesRead}**
                Mean Score: **${data.statistics.manga.meanScore}**`, true)
                .setThumbnail(data.avatar.large)
                .setColor(message.member?.displayColor || bot.config.general.embedColor);

            // Send the embed
            message.reply({ embeds: [embed] });
        }).catch((err) => {
            // Send the error message
            message.errorReply(`Something went wrong while fetching the profile: \`${err.message}\``);
        });
    },
};
