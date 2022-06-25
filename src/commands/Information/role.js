import { stripIndents } from 'common-tags';
import { MessageEmbed, Permissions } from 'discord.js';
import config from '../../config.js';

export default {
    info: {
        name: 'role',
        usage: '',
        examples: [],
        description: 'Get information about server roles.',
        category: 'Miscellaneous',
        info: null,
        selfPerms: [
            Permissions.FLAGS.EMBED_LINKS,
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
            type: 'SUB_COMMAND',
            description: 'Get information about a role.',
            options: [{
                name: 'role',
                type: 'ROLE',
                description: 'The role you wish to view information about.',
                required: true,
            }],
        }, {
            name: 'list',
            type: 'SUB_COMMAND',
            description: 'View a list of all roles in a server.',
            options: [{
                name: 'page',
                type: 'INTEGER',
                description: 'The page you wish to view.',
                required: false,
            }],
        }],
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'info') {
            // Get the role
            const { role } = interaction.options.get('role');

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor({ name: `Role: ${role.name}`, iconUrl: `https://dummyimage.com/64x64/${role.hexColor.replace('#', '')}/${role.hexColor.replace('#', '')}` })
                .setThumbnail(`https://dummyimage.com/256x256/${role.hexColor.replace('#', '')}/${role.hexColor.replace('#', '')}`)
                .setFooter({ text: `ID: ${role.id}` })
                .setColor(role.hexColor ?? bot.config.general.embedColor)
                .setDescription(stripIndents`**Position:** ${role.position + 1}/${interaction.guild.roles.cache.size}
            **Color:** ${!role.color ? 'Default' : role.hexColor}
            **${role.members.size} member(s)** | ${config.emojis.online} **${role.members.filter((m) => m.presence && m.presence.status !== 'offline').size}** online
            **Created:** <t:${Math.trunc(role.createdTimestamp / 1000)}> (<t:${Math.trunc(role.createdTimestamp / 1000)}:R>)
            **Hoisted:** ${role.hoist.toString().toTitleCase()}
            **Mentionable:** ${role.mentionable.toString().toTitleCase()}`);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'list') {
            // Define page vars
            const pages = [];
            let page = 0;

            // Sort the roles by position
            const sorted = Array.from(interaction.guild.roles.cache.values()).sort((a, b) => b.position - a.position);

            // Devide the roles into pages of 10
            for (let i = 0; i < sorted.length; i += 10) {
                pages.push(sorted.slice(i, i + 10));
            }

            // If the page option is there set it as the page
            // eslint-disable-next-line no-param-reassign, no-multi-assign
            if (interaction.options.get('page')?.value) page = interaction.options.get('page').value -= 1;
            // Return if the page wasn't found
            if (!pages[page]) return interaction.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map((r) => `${r} | **ID:** ${r.id} | **${r.members?.size}** member(s)`);

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor({ name: `Roles of ${interaction.guild.name}`, iconUrl: interaction.guild.iconURL({ format: 'png', dynamic: true }) })
                .setFooter({ text: `${sorted.length} total roles | Page ${page + 1} of ${pages.length}` })
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description.join('\n'));

            // Send the embed
            interaction.reply({ embeds: [embed] });
        }
    },
};
