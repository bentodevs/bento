import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, Collection, EmbedBuilder, GuildEmoji, GuildMember, PermissionFlagsBits, Snowflake,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'emotes',
        usage: 'emotes [page]',
        examples: [
            'emotes 2',
            'emotes 5',
        ],
        description: 'List all emotes in this guild.',
        category: 'Information',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
        ],
    },
    opts: {
        guildOnly: true,
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
            name: 'page',
            type: ApplicationCommandOptionType.Number,
            description: 'The page you want to view.',
            required: false,
            maxValue: 25,
            minValue: 1
        }],
        defaultPermission: false,
        dmPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Define pages vars
        const pages: Array<Array<GuildEmoji>> = [];
        let page = 0;

        // Grab the emotes and sort them
        const emotes = await interaction.guild?.emojis.fetch() as Collection<Snowflake, GuildEmoji>;
        const sortedRaw = emotes.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
        const sorted = Array.from(sortedRaw.values());

        // Devide the emotes into pages of 10
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // If the page option is there set it as the page
        if (interaction.options.getNumber('page')) page = interaction.options.getNumber('page', true) - 1;
        // If the page doesn't exist return an error
        if (!pages[page]) return InteractionResponseUtils.error(interaction, "You didn't specify a valid page!", true);

        // Prepare the description
        const description = pages[page].map((a) => `${a} | **Name:** ${a.name} | **ID:** ${a.id} `);

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Emotes of ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
            .setFooter({ text: `${emotes.size} total emotes | Page ${page + 1} of ${pages.length}` })
            .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
            .setDescription(description.join('\n'));

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
