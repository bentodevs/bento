import { stripIndents } from 'common-tags';
import { startOfToday } from 'date-fns';
import { MessageEmbed, Permissions } from 'discord.js';
import config from '../../config.js';

export default {
    info: {
        name: 'member',
        usage: 'member <"stats" | "list"> [role] [page]',
        examples: [
            'member stats',
            'member list developer',
            'member list 2',
        ],
        description: 'View information about server members.',
        category: 'Information',
        info: null,
        selfPermis: [
            Permissions.FLAGS.EMBED_LINKS,
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
            name: 'stats',
            type: 'SUB_COMMAND',
            description: 'View member statistics for this server',
            options: [],
        }, {
            name: 'list',
            type: 'SUB_COMMAND',
            description: 'View a list of members in this server',
            options: [{
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
        }],
        defaultPermission: false,
    },

    run: async (bot, interaction) => {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'stats') {
            // 1. Grab the amount of members that joined today
            // 2. Grab the amount of members that joined this week
            // 3. Grab all the bans
            const joinedToday = interaction.guild.members.cache.filter((m) => m.joinedTimestamp >= startOfToday());
            const joinedWeek = interaction.guild.members.cache.filter((m) => m.joinedTimestamp >= startOfToday(Date.now()));
            const bans = await interaction.guild.bans.fetch();

            // Define all the ban messages
            const banMessages = {
                1: "That's not enough...",
                50: "That's a lot of bans... but not enough...",
                100: 'This is starting to look more like it.',
                1000: 'Do we really need this many?',
                2500: 'Holy shit are you addicted to banning or something?',
                3000: 'Okay its time to stop.',
                4000: 'Seriously you are still going?',
                5000: "Ok I'm just going to stop checking...",
            };

            // Define the ban message
            let banMessage = banMessages[1];

            // Set the ban message based on the amount of bans
            if (bans.size >= 50) banMessage = banMessages[50];
            if (bans.size >= 100) banMessage = banMessages[100];
            if (bans.size >= 1000) banMessage = banMessages[1000];
            if (bans.size >= 2500) banMessage = banMessages[2500];
            if (bans.size >= 3000) banMessage = banMessages[3000];
            if (bans.size >= 4000) banMessage = banMessages[4000];
            if (bans.size >= 5000) banMessage = banMessages[5000];

            // eslint-disable-next-line no-nested-ternary
            const banCount = bans.size <= 0 ? '' : bans.size > 1 ? 'bans' : 'ban';

            // Create the embed
            const embed = new MessageEmbed()
                .setAuthor({ name: `Member Stats for ${interaction.guild.name}`, iconUrl: interaction.guild.iconURL({ format: 'png', dynamic: true }) })
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setFooter({ text: `ID: ${interaction.guild.id}` })
                .setTimestamp()
                .setDescription(stripIndents`🧑‍🤝‍🧑 **${interaction.guild.memberCount.toLocaleString()}** members | **${interaction.guild.members.cache.filter((m) => m.presence?.status && m.presence.status !== 'offline').size.toLocaleString()}** ${bot.config.emojis.online} Online
            📅 **${joinedToday.size}** members gained today
            🗓️ **${joinedWeek.size}** members gained this week
            ${config.emojis.bans} ${bans.size <= 0 ? '**0** bans' : `**${bans.size.toLocaleString()}**`} ${banCount} *(${banMessage})*`);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'list') {
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
        }
    },
};
