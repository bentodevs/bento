import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../data/constants';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';
import { request } from 'undici';
import logger from '../../logger';
import { DuckDuckGoRelatedTopic, DuckDuckGoResponse } from '../../types';

const command: Command = {
    info: {
        name: 'duckduckgo',
        usage: 'duckduckgo <search query>',
        examples: ['duckduckgo Elon Musk age'],
        description: 'Fetch an instant answer from DuckDuckGo',
        category: 'Fun',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
        ],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        opts: [{
            name: 'query',
            type: ApplicationCommandOptionType.String,
            description: 'The search you wish to complete.',
            required: true,
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Fetch the raw search query
        // Combine the search phrase with + to form the URL part
        const rawQuery = interaction.options.get('query')?.value;
        const searchTerm = (rawQuery as string).split(' ').join('+');

        try {
            // Fetch the data & convert json
            const { body } = await request(`https://api.duckduckgo.com/?q=${searchTerm}&format=json&t=Bento_Bot_Discord`);
            const data: DuckDuckGoResponse = await body.json();

            if (!data.Type) return InteractionResponseUtils.error(interaction, "I couldn't find any instant answers for that!", true);

            const description: string[] = data.RelatedTopics
                .slice(0, 5)
                .filter((a: DuckDuckGoRelatedTopic) => a.FirstURL)
                .map((b: DuckDuckGoRelatedTopic) => `**${b.Text}**\n[${b.FirstURL}](${b.FirstURL})\n`);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `DuckDuckGo results for: ${rawQuery}` })
                .setDescription(stripIndents`${description}`)
                .setColor(DEFAULT_COLOR);

            if (data.Image) embed.setThumbnail(`https://duckduckgo.com${data.Image}`);

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            logger.error("Failed to fetch duckduckgo data:", err);
            InteractionResponseUtils.error(interaction, "I couldn't find any instant answers for that!", true);
        }
    },
};

export default command;
