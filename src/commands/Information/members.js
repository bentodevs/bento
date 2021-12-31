import { MessageEmbed } from 'discord.js';
import { getRole } from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'members',
        aliases: [
            'listmembers',
        ],
        usage: 'members [role] [page]',
        examples: [
            'members staff',
            'members staff 2',
            'members 2',
        ],
        description: 'List all server members or all members with a specific role.',
        category: 'Information',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'role',
            type: 'ROLE',
            description: 'Select a role to display the members of.',
            required: false,
        }, {
            name: 'page',
            type: 'INTEGER',
            description: 'The page you want to view.',
            required: false,
        }],
    },

    async run(bot, message, args) {
        // Get the specified role (if any)
        let role = await getRole(message, !isNaN(args[args.length - 1]) && !/^[0-9]{16,}$/.test(args[args.length - 1]) ? args.slice(0, args.length - 1).join(' ') : args.join(' '));

        // If args[0] is a number set role to undefined
        if (!isNaN(args[0]) && role?.id !== args[0]) role = undefined;

        // If the user specified a invalid role return an error
        if (!role && args[0]) return message.errorReply("You didn't specify a valid role!");

        if (!role) {
            // Pages variables
            const pages = [];
            let page = 0;

            // Sort members by role position
            const members = Array.from(message.guild.members.cache.sort((a, b) => b.roles.highest.position - a.roles.highest.position).values());

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < members.length; i += 20) {
                pages.push(members.slice(i, i + 20));
            }

            // If args[0] is a number set it as the page
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (!isNaN(args[0])) page = args[0] -= 1;
            // Return if the page wasn't found
            if (!pages[page]) return message.errorReply("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map((m) => `\`${m.user.tag}\` | **ID:** ${m.id}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor({ name: `Members of ${message.guild.name}`, iconUrl: message.guild.iconURL({ format: 'png', dynamic: true }) })
                .setFooter({ text: `${message.guild.memberCount} total members | Page ${page + 1} of ${pages.length}` })
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setDescription(description.join('\n'));

            // Send the members embed
            message.reply({ embeds: [embed] });
        } else if (role) {
            // Pages variables
            const pages = [];
            let page = 0;

            // Return an error if the role doesn't have any members
            if (!role.members.size) return message.errorReply("The role you specified doesn't have any members!");

            // Format and map the members
            const members = Array.from(role.members.values());

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < members.length; i += 20) {
                pages.push(members.slice(i, i + 20));
            }

            // Check if a page was specified and set it as that page
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (!isNaN(args[args.length - 1]) && !/^[0-9]{16,}$/.test(args[args.length - 1])) page = args[args.length - 1] -= 1;

            // If the page specified doesn't exists return
            if (!pages[page]) return message.errorReply("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map((m) => `\`${m.user.tag}\` | **ID:** ${m.id}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor({ name: `Members of ${message.guild.name}`, iconUrl: message.guild.iconURL({ format: 'png', dynamic: true }) })
                .setFooter({ text: `${role.members.size} total members | Page ${page + 1} of ${pages.length}` })
                .setColor(role.hexColor ?? bot.config.general.embedColor)
                .setDescription(description.join('\n'));

            // Send the members embed
            message.reply({ embeds: [embed] });
        }
    },

    run_interaction: async (bot, interaction) => {
        const role = interaction.options.get('role')?.role;

        if (!role) {
            // Pages variables
            const pages = [];
            let page = 0;

            // Sort members by role position
            const members = Array.from(interaction.guild.members.cache.sort((a, b) => b.roles.highest.position - a.roles.highest.position).values());

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < members.length; i += 20) {
                pages.push(members.slice(i, i + 20));
            }

            // If the page option is there set it as the page
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (interaction.options.get('page')?.value) page = interaction.options.get('page').value -= 1;
            // Return if the page wasn't found
            if (!pages[page]) return interaction.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map((m) => `\`${m.user.tag}\` | **ID:** ${m.id}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor({ name: `Members of ${interaction.guild.name}`, iconUrl: interaction.guild.iconURL({ format: 'png', dynamic: true }) })
                .setFooter({ text: `${interaction.guild.memberCount} total members | Page ${page + 1} of ${pages.length}` })
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description.join('\n'));

            // Send the members embed
            interaction.reply({ embeds: [embed] });
        } else {
            // Pages variables
            const pages = [];
            let page = 0;

            // Return an error if the role doesn't have any members
            if (!role.members.size) return interaction.error("The role you specified doesn't have any members!");

            // Format and map the members
            const members = Array.from(role.members.values());

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < members.length; i += 20) {
                pages.push(members.slice(i, i + 20));
            }

            // If the page option is there set it as the page
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (interaction.options.get('page')?.value) page = interaction.options.get('page').value -= 1;
            // Return if the page wasn't found
            if (!pages[page]) return interaction.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map((m) => `\`${m.user.tag}\` | **ID:** ${m.id}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor({ name: `Members of ${role.name}`, iconUrl: interaction.guild.iconURL({ format: 'png', dynamic: true }) })
                .setFooter({ text: `${role.members.size} total members | Page ${page + 1} of ${pages.length}` })
                .setColor(role.hexColor ?? bot.config.general.embedColor)
                .setDescription(description.join('\n'));

            // Send the members embed
            interaction.reply({ embeds: [embed] });
        }
    },
};
