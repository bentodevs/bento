import { stripIndents } from 'common-tags';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, PermissionFlagsBits, Role, Snowflake,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd.js';
import { DEFAULT_COLOR } from '../../modules/structures/constants.js';
import emojis from '../../modules/structures/emotes.js';
import { InteractionResponseUtils, StringUtils } from '../../modules/utils/TextUtils.js';

const command: Command = {
    info: {
        name: 'role',
        usage: '',
        examples: [],
        description: 'Get information about server roles.',
        category: 'Information',
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
            name: 'info',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Get information about a role.',
            options: [{
                name: 'role',
                type: ApplicationCommandOptionType.Role,
                description: 'The role you wish to view information about.',
                required: true,
            }],
        }, {
            name: 'list',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View a list of all roles in a server.',
            options: [{
                name: 'page',
                type: ApplicationCommandOptionType.Number,
                description: 'The page you wish to view.',
                required: false,
            }],
        }],
        defaultPermission: true,
        dmPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'info') {
            // Get the role
            const role = interaction.options.getRole('role') as Role;
            const membersOnline = role.members?.filter((m: GuildMember) => m.presence?.status !== 'offline').size;

            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Role: ${role?.name}`, iconURL: `https://dummyimage.com/64x64/${role.hexColor?.replace('#', '')}/${role.hexColor.replace('#', '')}` })
                .setThumbnail(`https://dummyimage.com/256x256/${role.hexColor.replace('#', '')}/${role.hexColor.replace('#', '')}`)
                .setFooter({ text: `ID: ${role?.id}` })
                .setColor((role as Role).hexColor ?? DEFAULT_COLOR)
                .setDescription(stripIndents`**Position:** ${role.position + 1}/${interaction.guild?.roles.cache.size}
            **Color:** ${!role.color ? 'Default' : role.hexColor}
            **${role.members.size} member(s)** | ${emojis.online} **${membersOnline}** online
            **Created:** <t:${Math.trunc(role.createdTimestamp / 1000)}> (<t:${Math.trunc(role.createdTimestamp / 1000)}:R>)
            **Hoisted:** ${StringUtils.toTitleCase(role.hoist.toString())}
            **Mentionable:** ${StringUtils.toTitleCase(role.mentionable.toString())}`);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'list') {
            // Define page vars
            const pages: Array<Array<Role>> = [];
            let page = 0;

            const rolesList = await interaction.guild?.roles.fetch() as Collection<Snowflake, Role>;

            // Sort the roles by position
            const roles = Array.from(rolesList?.values());
            const sorted = roles?.sort((a, b) => b.position - a.position);

            // Devide the roles into pages of 10
            for (let i = 0; i < sorted.length; i += 10) {
                pages.push(sorted.slice(i, i + 10));
            }

            // If the page option is there set it as the page
            if (interaction.options.get('page')?.value) page = interaction.options.getNumber('page', true) - 1;
            // Return if the page wasn't found
            if (!pages[page]) return InteractionResponseUtils.error(interaction, "You didn't specify a valid page!", true);

            // Format the description
            const description = pages[page].map((r: Role) => `${r} | **ID:** ${r.id} | **${r.members?.size}** member(s)`);

            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Roles of ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
                .setFooter({ text: `${sorted.length} total roles | Page ${page + 1} of ${pages.length}` })
                .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
                .setDescription(description.join('\n'));

            // Send the embed
            interaction.reply({ embeds: [embed] });
        }
    },
};

export default command;
