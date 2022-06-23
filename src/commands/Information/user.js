import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { format, formatDistance } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import config from '../../config.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'user',
        usage: 'user [user]',
        examples: [
            'user info Jarno',
            'user banner Waitrose',
        ],
        description: 'Get information about a guild member or Discord user.',
        category: 'Information',
        info: null,
        options: [],
        selfPerms: [
            'EMBED_LINKS',
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
            type: 'SUB_COMMAND',
            options: [{
                name: 'user',
                type: 'USER',
                description: 'Specify a user.',
                required: false,
            }],
        }, {
            name: 'avatar',
            description: 'View a users avatar',
            type: 'SUB_COMMAND',
            options: [{
                name: 'user',
                type: 'USER',
                description: "The user who's avatar you want to display.",
                required: false,
            }, {
                name: 'server',
                type: 'BOOLEAN',
                description: "Display the user's server avatar instead of the user avatar.",
                required: false,
            }],
        }, {
            name: 'banner',
            description: 'View a users banner',
            type: 'SUB_COMMAND',
            options: [{
                name: 'user',
                type: 'USER',
                description: "The user who's banner you want to display.",
                required: false,
            }, {
                name: 'server',
                type: 'BOOLEAN',
                description: "Display the user's server banner instead of the user banner.",
                required: false,
            }],
        }],
        defaultPermission: true,
    },

    async run(bot, interaction) {
        const subCmd = interaction.options.getSubcommand();

        if (subCmd === 'info') {
            // Grab the member or user
            const member = interaction.options?.get('user')?.member || interaction.options?.get('user')?.user;

            // Return an error if nothing was found
            if (!member) return interaction.error("You didn't specify a valid user!");

            // Create the MessageEmbed object.
            const embed = new MessageEmbed();

            console.log(member.user.createdTimestamp);

            // Check if the user is a guild member
            if (member.guild) {
                // If the user is boosting, get the time they started boosting & format it
                const userBoosted = member.premiumSinceTimestamp ? format(utcToZonedTime(member.premiumSinceTimestamp, interaction.settings.general.timezone), 'PPp (z)', { timeZone: interaction.settings.general.timezone }) : null;
                const timeSinceBoost = member.premiumSinceTimestamp ? formatDistance(member.premiumSinceTimestamp, Date.now(), { addSuffix: true }) : null;
                // Get the user's roles & format them
                const roles = member.roles.cache.filter((role) => role.name !== '@everyone').sort((b, a) => a.position - b.position).map((role) => role.toString()).join(', ');

                // Define vars
                let statusEmote;
                let statusText;

                // Switch between statusses and set the variables accordingly
                switch (member.presence?.status) {
                case 'online':
                    statusEmote = bot.config.emojis.online;
                    statusText = '**Online**';
                    break;
                case 'idle':
                    statusEmote = bot.config.emojis.idle;
                    statusText = '**Idle**';
                    break;
                case 'offline':
                    statusEmote = bot.config.emojis.offline;
                    statusText = '**Offline**';
                    break;
                case 'dnd':
                    statusEmote = bot.config.emojis.dnd;
                    statusText = '**Do Not Disturb**';
                    break;
                default:
                    statusEmote = bot.config.emojis.offline;
                    statusText = '**Offline**';
                    break;
                }

                // Define the description
                let description = `**Created:** <t:${Math.trunc(member.user.createdTimestamp / 1000)}> (<t:${Math.trunc(member.user.createdTimestamp / 1000)}:R>)
            **Joined:** <t:${Math.trunc(member.joinedTimestamp / 1000)}> (<t:${Math.trunc(member.joinedTimestamp / 1000)}:R>)`;

                // If the user is a booster add it to the description
                if (member.premiumSinceTimestamp) description += `\n**Boosting:** ${userBoosted} (${timeSinceBoost})`;
                // If the user has roles add them to the description
                if (member.roles.cache.size > 1) description += `\n\n**Roles (${member.roles.cache.size - 1}):** ${roles}`;
                // Check if the user has any activities
                if (member.presence?.activities?.length >= 1) {
                    // Add the presence header to the description
                    description += '\n\n**Presence**';

                    // Loop through the users activities and add them to the description
                    member.presence.activities.forEach((a) => {
                        if (a.type === 'LISTENING') description += `\n${bot.config.emojis.spotify} Listening to: **${a.details}** by **${a.state}**`;
                        // eslint-disable-next-line no-nested-ternary
                        if (a.type === 'PLAYING') description += `\n${bot.config.emojis.game} Playing: **${a.name}**${a.timestamps ? a.timestamps.start ? ` for **${formatDistance(a.timestamps.start, Date.now())}**` : ` (${formatDistance(Date.now(), a.timestamps.end)} left)` : ''}`;
                        if (a.type === 'CUSTOM' && a.state) description += `\n${bot.config.emojis.discord} Custom Status: **${a.state}**`;
                        if (a.type === 'STREAMING') description += `\n${bot.config.emojis.twitch} Streaming: [${a.state}](${a.url})`;
                        if (a.type === 'WATCHING') description += `\n${bot.config.emojis.player} Watching: **${a.name}**`;
                        if (a.type === 'COMPETING') description += `\n${bot.config.emojis.trophy} Competing in: **${a.name}**`;
                    });

                    // Add the users status to the description
                    description += `\n${statusEmote} Status: **${statusText}**`;
                } else {
                    // Add the users status to the description
                    description += `\n\n${statusEmote} ${statusText}`;
                }

                // Prepare the embed
                embed.setAuthor({ name: `${member.user.tag}${member.nickname ? ` ~ ${member.nickname}` : ''}`, iconURL: member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
                embed.setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
                embed.setDescription(stripIndents(description));
                embed.setColor(member.displayHexColor ?? bot.config.general.embedColor);
                embed.setFooter({ text: `Member #${interaction.guild.members.cache.filter((u) => u.joinedTimestamp !== null).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map((user) => user.id).indexOf(member.id) + 1} | ID: ${member.id}` });
            } else {
                // Get the users account creation time and format it
                const userCreated = format(utcToZonedTime(member.createdTimestamp, interaction.settings.general.timezone), 'PPp (z)', { timeZone: interaction.settings.general.timezone }); const timeSinceCreated = formatDistance(member.createdTimestamp, Date.now(), { addSuffix: true });

                // Define status var
                let status;

                // Switch between statusses and set the variables accordingly
                switch (member.presence?.status) {
                case 'online':
                    status = `${config.emojis.online} **Online**`;
                    break;
                case 'idle':
                    status = `${config.emojis.idle} **Idle**`;
                    break;
                case 'offline':
                    status = `${config.emojis.offline} **Offline**`;
                    break;
                case 'dnd':
                    status = `${config.emojis.dnd} **Do Not Disturb**`;
                    break;
                default:
                    status = `${config.emojis.offline} **Offline**`;
                }

                // Prepare the embed
                embed.setAuthor({ name: member.tag, iconURL: member.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
                embed.setThumbnail(member.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
                embed.setColor(bot.config.general.embedColor);
                embed.setDescription(stripIndents`🙍 Human | ${status}
            **Created:** ${userCreated} (${timeSinceCreated})

            ${interaction?.guildId ? '*This user is not a member of the server. No additional info is available.*' : "*No more information is available in DM's*"}`);
                embed.setFooter({ text: `ID: ${member.id}` });
            }

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (subCmd === 'avatar') {
            // Get the user
            const target = interaction.options.get('user')?.user ?? interaction.user;
            const server = interaction.options.get('server')?.value;

            if (server && interaction?.guild?.members?.cache?.has(target.id)) {
                if (!interaction.inGuild()) return interaction.error({ content: 'You must run this command in a server to get a guild avatar!', ephemeral: true });

                const guildTarget = interaction.options.get('user')?.member ?? interaction.member;

                // Build the embed
                const embed = new MessageEmbed()
                    .setColor(guildTarget.displayColor ?? bot.config.general.embedColor)
                    .setAuthor({ name: `Avatar for ${target.tag}`, iconURL: guildTarget.displayAvatarURL({ format: 'png', dynamic: true }) })
                    .setImage(guildTarget.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

                // Send the embed
                interaction.reply({ embeds: [embed] });
            } else {
            // Build the embed
                const embed = new MessageEmbed()
                    .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                    .setAuthor({ name: `Avatar for ${target.tag}`, iconURL: target.displayAvatarURL({ format: 'png', dynamic: true }) })
                    .setImage(target.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

                if (server && interaction.inGuild()) embed.setDescription(`*${target.tag} is in this server, so their global avatar is below*`);
                if (server && !interaction.inGuild()) embed.setDescription("*Server avatars cannot be fetched in DMs, so the user's global avatar is below*");

                // Send the embed
                interaction.reply({ embeds: [embed] });
            }
        } else if (subCmd === 'banner') {
            // Get the user
            const target = interaction.options.get('user')?.user ?? interaction.user;

            // Force fetch the target from the API
            // https://discord.js.org/#/docs/main/stable/class/User?scrollTo=bannerURL
            const usr = await bot.users.fetch(target.id, { force: true });

            if (!usr.bannerURL()) {
                return interaction.error({ content: "This user doesn't have a custom banner set!", ephemeral: true });
            }

            // Build the embed
            const embed = new MessageEmbed()
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setAuthor({ name: `Banner for ${target.tag}`, iconURL: target.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setImage(usr.bannerURL({ format: 'png', dynamic: true, size: 2048 }));

            // Send the embed
            interaction.reply({ embeds: [embed] });
        }
    },
};
