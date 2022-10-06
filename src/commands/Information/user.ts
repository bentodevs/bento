import { stripIndents } from 'common-tags';
import {
    ActivityType, APIInteractionDataResolvedGuildMember, ApplicationCommandOptionType, ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, PermissionFlagsBits, User,
} from 'discord.js';
import { formatDistance } from 'date-fns';
import { Command } from '../../modules/interfaces/cmd';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';
import { DEFAULT_COLOR } from '../../data/constants';
import emojis from '../../data/emotes';

const command: Command = {
    info: {
        name: 'user',
        description: 'Get information about a Server member, or Discord user.',
        usage: 'user [user]',
        examples: [
            'user info Jarno',
            'user banner Behn',
        ],
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
            user: true,
            message: false,
        },
        opts: [{
            name: 'info',
            description: 'Get information about a user',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'user',
                type: ApplicationCommandOptionType.User,
                description: 'Specify a user.',
                required: false,
            }],
        }, {
            name: 'avatar',
            description: 'View a users avatar',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'user',
                type: ApplicationCommandOptionType.User,
                description: "The user who's avatar you want to display.",
                required: false,
            }, {
                name: 'server',
                type: ApplicationCommandOptionType.Boolean,
                description: "Display the user's server avatar instead of the user avatar.",
                required: false,
            }],
        }, {
            name: 'banner',
            description: 'View a users banner',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'user',
                type: ApplicationCommandOptionType.User,
                description: "The user who's banner you want to display.",
                required: false,
            }, {
                name: 'server',
                type: ApplicationCommandOptionType.Boolean,
                description: "Display the user's server banner instead of the user banner.",
                required: false,
            }],
        }],
        defaultPermission: true,
        dmPermission: true,
    },
    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'info') {
            let member: GuildMember | User | APIInteractionDataResolvedGuildMember | undefined = interaction.options.getMember('user')
                || interaction.options.getUser('user') || interaction?.member || interaction.user;

            // Return an error if nothing was found
            if (!member) return InteractionResponseUtils.error(interaction, "You didn't specify a valid user!", true);

            // Create the MessageEmbed object.
            const embed = new EmbedBuilder();

            // Check if the user is a guild member
            if (member instanceof GuildMember && interaction.inGuild()) {
                if (member.partial) member = await interaction.guild?.members.fetch(member.id);
                // If the user is boosting, get the time they started boosting & format it
                const userBoosted = member?.premiumSinceTimestamp ? `<t:${Math.trunc(member.premiumSinceTimestamp / 1000)}>` : null;
                const timeSinceBoost = member?.premiumSinceTimestamp ? `<t:${Math.trunc(member.premiumSinceTimestamp / 1000)}:R>` : null;
                // Get the user's roles & format them
                const roles = member?.roles.cache.filter((role) => role.name !== '@everyone').sort((b, a) => a.position - b.position).map((role) => role.toString()).join(', ') ?? [];

                // Define vars
                let statusEmote = '';
                let statusText = '';

                // Switch between statusses and set the variables accordingly
                switch (member?.presence?.status) {
                    case 'online':
                        statusEmote = emojis.online;
                        statusText = '**Online**';
                        break;
                    case 'idle':
                        statusEmote = emojis.idle;
                        statusText = '**Idle**';
                        break;
                    case 'offline':
                        statusEmote = emojis.offline;
                        statusText = '**Offline**';
                        break;
                    case 'dnd':
                        statusEmote = emojis.dnd;
                        statusText = '**Do Not Disturb**';
                        break;
                    default:
                        statusEmote = emojis.offline;
                        statusText = '**Offline**';
                        break;
                }

                const userCreated = member?.user.createdTimestamp ?? 0;
                const userJoinedGuild = member?.joinedTimestamp ?? 0;

                // Define the description
                let description = `${member?.user.id === interaction.guild?.ownerId ? '👑 Server Owner | ' : ''}${member?.user.bot ? '🤖 Bot' : '🙍 Human'}
                **Created:** <t:${Math.trunc(userCreated / 1000)}> (<t:${Math.trunc(userCreated / 1000)}:R>)
            **Joined:** <t:${Math.trunc(userJoinedGuild / 1000)}> (<t:${Math.trunc(userJoinedGuild / 1000)}:R>)`;

                // If the user is a booster add it to the description
                if (member?.premiumSinceTimestamp) description += `\n**Boosting:** ${userBoosted} (${timeSinceBoost})`;
                // If the user has roles add them to the description
                if (roles.length) description += `\n\n**Roles (${roles.length}):** ${roles}`;
                // Check if the user has any activities
                if (member?.presence?.activities.length ?? 0 >= 1) {
                    // Add the presence header to the description
                    description += '\n\n**Presence**';

                    // Loop through the users activities and add them to the description
                    member?.presence?.activities.forEach((a) => {
                        if (a.type === ActivityType.Listening) description += `\n${emojis.spotify} Listening to: **${a.details}** by **${a.state}**`;
                        // eslint-disable-next-line no-nested-ternary
                        if (a.type === ActivityType.Playing) description += `\n${emojis.game} Playing: **${a.name}**${a.timestamps ? a.timestamps.start ? ` for **${formatDistance(a.timestamps.start, Date.now())}**` : ` (${formatDistance(Date.now(), a?.timestamps?.end ?? 0)} left)` : ''}`;
                        if (a.type === ActivityType.Custom && a.state) description += `\n${emojis.discord} Custom Status: **${a.state}**`;
                        if (a.type === ActivityType.Streaming) description += `\n${emojis.twitch} Streaming: [${a.state}](${a.url})`;
                        if (a.type === ActivityType.Watching) description += `\n${emojis.player} Watching: **${a.name}**`;
                        if (a.type === ActivityType.Competing) description += `\n${emojis.trophy} Competing in: **${a.name}**`;
                    });

                    // Add the users status to the description
                    description += `\n${statusEmote} Status: **${statusText}**`;
                } else {
                    // Add the users status to the description
                    description += `\n\n${statusEmote} ${statusText}`;
                }

                const guildMemberList = await interaction.guild?.members.fetch();

                // Prepare the embed
                embed.setAuthor({ name: `${member?.user.tag}${member?.nickname ? ` ~ ${member.nickname}` : ''}`, iconURL: member?.user.displayAvatarURL() });
                embed.setThumbnail(member?.user.displayAvatarURL({ size: 1024 }) ?? '');
                embed.setDescription(stripIndents(description));
                embed.setColor(member?.displayHexColor ?? DEFAULT_COLOR);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                embed.setFooter({ text: `Member #${(guildMemberList as Collection<string, GuildMember>).filter((u) => u.joinedTimestamp !== null).sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!).map((user) => user.id).indexOf(member?.id ?? '') + 1} | ID: ${member?.id}` });
            } else {
                // Prepare the embed
                embed.setAuthor({ name: (member as User).tag, iconURL: (member as User).displayAvatarURL() });
                embed.setThumbnail((member as User).displayAvatarURL({ size: 1024 }));
                embed.setColor(DEFAULT_COLOR);
                embed.setDescription(stripIndents`${(member as User).bot ? '🤖 Bot' : '🙍 Human'}
            **Created:** <t:${Math.trunc((member as User).createdTimestamp / 1000)}> (<t:${Math.trunc((member as User).createdTimestamp / 1000)}:R>)

            ${interaction?.guildId ? '*This user is not a member of the server. No additional info is available.*' : "*No more information is available in DM's*"}`);
                embed.setFooter({ text: `ID: ${(member as User).id}` });
            }

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (subCommand === 'avatar') {
            // Get the user
            const target = interaction.options.getUser('user') ?? interaction.user;
            const server = interaction.options.getBoolean('server');
            const { member } = interaction;
            let guildTarget: GuildMember | undefined;

            if (server && interaction.inGuild()) guildTarget = await interaction.guild?.members.fetch(target.id);

            if (server && guildTarget) {
                if (!interaction.inGuild()) return InteractionResponseUtils.error(interaction, 'You must run this command in a server to get a guild avatar', true);

                // Build the embed
                const embed = new EmbedBuilder()
                    .setColor(guildTarget?.displayHexColor ?? DEFAULT_COLOR)
                    .setAuthor({ name: `Avatar for ${target.tag}`, iconURL: guildTarget.displayAvatarURL() ?? '' })
                    .setImage(guildTarget?.displayAvatarURL({ size: 1024 }) ?? '');

                // Send the embed
                interaction.reply({ embeds: [embed] });
            } else {
                // Build the embed
                const embed = new EmbedBuilder()
                    .setColor((member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
                    .setAuthor({ name: `Avatar for ${target.tag}`, iconURL: target.displayAvatarURL() })
                    .setImage(target.displayAvatarURL({ size: 2048 }));

                if (server && interaction.inGuild()) embed.setDescription(`*${target.tag} is not in this server, so their global avatar is below*`);
                if (server && !interaction.inGuild()) embed.setDescription("*Server avatars cannot be fetched in DMs, so the user's global avatar is below*");

                // Send the embed
                interaction.reply({ embeds: [embed] });
            }
        } else if (subCommand === 'banner') {
            // Get the user
            const target = interaction.options.get('user')?.user ?? interaction.user;

            // Force fetch the target from the API
            // https://discord.js.org/#/docs/main/stable/class/User?scrollTo=bannerURL
            const usr = await bot.users.fetch(target.id, { force: true });

            if (!usr.bannerURL()) return InteractionResponseUtils.error(interaction, "This user doesn't have a custom banner set!", true);

            // Build the embed
            const embed = new EmbedBuilder()
                .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
                .setAuthor({ name: `Banner for ${target.tag}`, iconURL: target.displayAvatarURL() })
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                .setImage(usr.bannerURL({ size: 2048 })!);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        }
    },
};

export default command;
