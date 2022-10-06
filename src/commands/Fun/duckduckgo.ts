import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType, EmbedBuilder, GuildMember, PermissionFlagsBits } from 'discord.js';
import fetch, { Response } from 'node-fetch';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../data/constants';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

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

        // Fetch the data & convert json
        fetch(`https://api.duckduckgo.com/?q=${searchTerm}&format=json&t=Bento_Bot_Discord`)
            .then((res: Response) => res.json())
            .then((data: any) => {
                if (!data.Type) return InteractionResponseUtils.error(interaction, "I couldn't find any instant answers for that!", true);

                const description: string = data.RelatedTopics
                    .slice(0, 5)
                    .filter((a: any) => a.FirstURL)
                    .map((b: any) => `**${b.Text}**\n[${b.FirstURL}](${b.FirstURL})\n`);

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `DuckDuckGo results for: ${rawQuery}` })
                    .setThumbnail(data.Image ?? '')
                    .setDescription(stripIndents`${description}`)
                    .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR);

                interaction.reply({ embeds: [embed] });
            })
            .catch((err) => InteractionResponseUtils.error(interaction, `Oops! I ran into an error: ${err.message}`, true));
    },
};

export default command;
