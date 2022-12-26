import { stripIndents } from 'common-tags';
import { startOfToday, startOfWeek } from 'date-fns';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, PermissionFlagsBits, Role, Snowflake,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../data/constants';
import emojis from '../../data/emotes';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
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
            name: 'stats',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View member statistics for this server',
            options: [],
        }, {
            name: 'list',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View a list of members in this server',
            options: [{
                name: 'role',
                type: ApplicationCommandOptionType.Role,
                description: 'Select a role to display the members of.',
                required: false,
            }, {
                name: 'page',
                type: ApplicationCommandOptionType.Number,
                description: 'The page you want to view.',
                required: false,
            }],
        }],
        defaultPermission: false,
        dmPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'stats') {
            // 1. Grab the amount of members that joined today
            // 2. Grab the amount of members that joined this week
            // 3. Grab all the bans
            const joinedToday = interaction.guild?.members.cache.filter((m: GuildMember) => m.joinedTimestamp !== null && new Date(m.joinedTimestamp) >= startOfToday());
            const joinedWeek = interaction.guild?.members.cache.filter((m: GuildMember) => m.joinedTimestamp !== null && new Date(m.joinedTimestamp) >= startOfWeek(Date.now(), { weekStartsOn: 1 }));
            const bans = await interaction.guild?.bans.fetch();
            const membersOnline = interaction.guild?.members.cache?.filter((m: GuildMember) => m.presence?.status !== 'offline').size;

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
            if ((bans?.size ?? 0) >= 50) banMessage = banMessages[50];
            if ((bans?.size ?? 0) >= 100) banMessage = banMessages[100];
            if ((bans?.size ?? 0) >= 1000) banMessage = banMessages[1000];
            if ((bans?.size ?? 0) >= 2500) banMessage = banMessages[2500];
            if ((bans?.size ?? 0) >= 3000) banMessage = banMessages[3000];
            if ((bans?.size ?? 0) >= 4000) banMessage = banMessages[4000];
            if ((bans?.size ?? 0) >= 5000) banMessage = banMessages[5000];

            // eslint-disable-next-line no-nested-ternary
            const banCount = (bans?.size ?? 0) <= 0 ? '' : (bans?.size ?? 0) > 1 ? 'bans' : 'ban';

            // Create the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Member Stats for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
                .setColor(DEFAULT_COLOR)
                .setFooter({ text: `ID: ${interaction.guild?.id}` })
                .setTimestamp()
                .setDescription(stripIndents`🧑‍🤝‍🧑 **${interaction.guild?.memberCount.toLocaleString()}** members | **${membersOnline?.toLocaleString()}** ${emojis.online} Online
            📅 **${joinedToday?.size ?? 0}** members gained today
            🗓️ **${joinedWeek?.size ?? 0}** members gained this week
            ${emojis.bans} ${(bans?.size ?? 0) <= 0 ? '**0** bans' : `**${bans?.size.toLocaleString()}**`} ${banCount} *(${banMessage})*`);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'list') {
            const role = interaction.options.getRole('role') as Role;

            if (!role) {
                // Pages variables
                const pages: Array<Array<GuildMember>> = [];
                let page = 0;

                const membersList = await interaction.guild?.members.fetch() as Collection<Snowflake, GuildMember>;
                const membersSorted = membersList.sort((a: GuildMember, b: GuildMember) => b.roles.highest.position - a.roles.highest.position);

                // Sort members by role position
                const members: GuildMember[] = Array.from(membersSorted.values());

                // Loop through the members and devide them into pages of 20
                for (let i = 0; i < members.length; i += 20) {
                    pages.push(members.slice(i, i + 20));
                }

                // If the page option is there set it as the page
                // eslint-disable-next-line no-multi-assign, no-param-reassign
                if (interaction.options.get('page')?.value) page = interaction.options.getNumber('page', true) - 1;
                // Return if the page wasn't found
                if (!pages[page]) return InteractionResponseUtils.error(interaction, "You didn't specify a valid page!", true);

                // Format the description
                const description = pages[page].map((m: GuildMember) => `\`${m.user.tag}\` | **ID:** ${m.id}`);

                // Create the members embed
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Members of ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
                    .setFooter({ text: `${interaction.guild?.memberCount} total members | Page ${page + 1} of ${pages.length}` })
                    .setColor(DEFAULT_COLOR)
                    .setDescription(description.join('\n'));

                // Send the members embed
                interaction.reply({ embeds: [embed] });
            } else {
            // Pages variables
                const pages: Array<Array<GuildMember>> = [];
                let page = 0;
                let pageNumber = interaction.options.getNumber('page') ?? 1;

                // Return an error if the role doesn't have any members
                if (!role.members.size) return InteractionResponseUtils.error(interaction, "The role you specified doesn't have any members!", false);

                // Format and map the members
                const members: GuildMember[] = Array.from(role.members.values());

                // Loop through the members and devide them into pages of 20
                for (let i = 0; i < members.length; i += 20) {
                    pages.push(members.slice(i, i + 20));
                }

                // If the page option is there set it as the page
                // eslint-disable-next-line no-multi-assign, no-param-reassign
                if (interaction.options.getNumber('page')) page = pageNumber -= 1;
                // Return if the page wasn't found
                if (!pages[page]) return InteractionResponseUtils.error(interaction, "You didn't specify a valid page!", false);

                // Format the description
                const description = pages[page].map((m) => `\`${m.user.tag}\` | **ID:** ${m.id}`);

                // Create the members embed
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Members of ${role.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
                    .setFooter({ text: `${role.members.size} total members | Page ${page + 1} of ${pages.length}` })
                    .setColor(role.hexColor ?? DEFAULT_COLOR)
                    .setDescription(description.join('\n'));

                // Send the members embed
                interaction.reply({ embeds: [embed] });
            }
        }
    },
};

export default command;
