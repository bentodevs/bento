import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { getMedia } from '../../modules/functions/anilist.js';

export default {
    info: {
        name: 'anime',
        aliases: [],
        usage: 'anime [anime title]',
        examples: [
            'anime Attack on Titan',
        ],
        description: 'Search for anime on anilist.co',
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
            name: 'title',
            type: 'STRING',
            description: 'The title of the anime.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // Get the data
        getMedia(message.options?.get('title')?.value ?? args.join(' '), 'ANIME').then((data) => {
            // Get the description and remove html tags and markdown
            let description = data.description.removeHTML().convertMarkdown();

            if (description.length >= 4096) {
                // Make the description shorter
                description = description.slice(0, 4000);

                // Check how many spoiler tags are in the description
                const spoilers = description.match(/\|\|/g).length;

                // If the number of spoilers is even add ... to the description
                // If the number of spoilers isn't even add ...|| to the description to close off the spoiler
                if (spoilers % 2 === 0) {
                    description += '...';
                } else {
                    description += '...||';
                }
            }

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor({ name: data.title.romaji, iconURL: 'https://i.imgur.com/3Crs2k9.png', url: data.siteUrl })
                .setDescription(stripIndents`${description}

                [More Info](${data.siteUrl})`)
                .setImage(`https://img.anili.st/media/${data.id}`)
                .setColor(message.member?.displayColor || bot.config.general.embedColor);

            // Send the embed
            message.reply({ embeds: [embed] });
        }).catch((err) => {
            // Send the error message
            message.errorReply(`Something went wrong while fetching the anime: \`${err.message}\``);
        });
    },
};
