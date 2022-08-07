import { format, formatDistance } from 'date-fns';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';
import { InteractionResponseUtils } from '../../modules/utils/TextUtils';

const command: Command = {
    info: {
        name: 'boosters',
        usage: 'boosters [page]',
        examples: [
            'boosters 2',
        ],
        description: 'List the users that are boosting the guild.',
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
        }],
        defaultPermission: false,
        dmPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Page vars
        const pages: Array<Array<GuildMember>> = [];
        let page = 0;

        // Get the boosters
        const boosters = interaction.guild?.members.cache.filter((a: GuildMember) => a.premiumSinceTimestamp !== null);

        // If the guild has no boosters return an error
        if (!boosters?.size) return InteractionResponseUtils.error(interaction, "This guild doesn't have any boosters!", true);

        // Sort the boosters
        const sorted = boosters.sort((a: GuildMember, b: GuildMember) => (a.premiumSinceTimestamp ?? 0) - (b.premiumSinceTimestamp ?? 0));
        const sortedArray = Array.from(sorted.values());
        // Loop through the boosters and seperate them into pages of 10
        for (let i = 0; i < sorted.size; i += 10) {
            pages.push(sortedArray.slice(i, i + 10));
        }

        // If the page option is there set it as the page
        if (interaction.options.get('page')?.value) page = (interaction.options.getNumber('page') as number) - 1;
        // If the page doesn't exist return an error
        if (!pages[page]) return InteractionResponseUtils.error(interaction, "You didn't specify a valid page!", true);

        // Format the boosters
        const formatted = pages[page].map((a) => `\`${a.user.tag}\` | **Boosting Since:** ${format(a.premiumSinceTimestamp ?? Date.now(), 'PPp')} (${formatDistance(a.premiumSinceTimestamp ?? Date.now(), Date.now())} ago)`);

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Nitro Boosters of ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
            .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
            .setDescription(formatted.join('\n'))
            .setFooter({ text: `${sorted.size} total boosters | Page ${page + 1} of ${pages.length}` });

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
