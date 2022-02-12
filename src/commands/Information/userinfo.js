import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { format, formatDistance } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { getMember, getUser } from '../../modules/functions/getters.js';
import config from '../../config.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'userinfo',
        aliases: [
            'whois',
            'uinfo',
        ],
        usage: 'userinfo [user]',
        examples: [
            'userinfo Jarno',
            'userinfo Waitrose',
        ],
        description: 'Displays information about a guild member or Discord user.',
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
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'user',
            type: 'USER',
            description: 'Specify a user.',
            required: false,
        }],
    },
    context: {
        enabled: true,
    },

    async run(bot, message, args) {
        // Grab the member or user
        const member = message.options?.get('user')?.member || message.options?.get('user')?.user || await getMember(message, args?.join(' '), true) || await getUser(bot, message, args?.join(' '), true);

        // Return an error if nothing was found
        if (!member) return message.errorReply("You didn't specify a valid user!");

        // Create the MessageEmbed object.
        const embed = new MessageEmbed();

        // Check if the user is a guild member
        if (member.guild) {
            // Get the user's account creation date & format it
            const userCreated = format(utcToZonedTime(member.user.createdTimestamp, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone }); const timeSinceCreated = formatDistance(member.user.createdTimestamp, Date.now(), { addSuffix: true });
            // Get the user's guild join date & format it
            const userJoined = format(utcToZonedTime(member.joinedTimestamp, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone }); const timeSinceJoin = formatDistance(member.joinedTimestamp, Date.now(), { addSuffix: true });
            // If the user is boosting, get the time they started boosting & format it
            const userBoosted = member.premiumSinceTimestamp ? format(utcToZonedTime(member.premiumSinceTimestamp, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone }) : null; const timeSinceBoost = member.premiumSinceTimestamp ? formatDistance(member.premiumSinceTimestamp, Date.now(), { addSuffix: true }) : null;
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
            let description = `**Created:** ${userCreated} (${timeSinceCreated})
            **Joined:** ${userJoined} (${timeSinceJoin})`;

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
            embed.setFooter({ text: `Member #${message.guild.members.cache.filter((u) => u.joinedTimestamp !== null).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map((user) => user.id).indexOf(member.id) + 1} | ID: ${member.id}` });
        } else {
            // Get the users account creation time and format it
            const userCreated = format(utcToZonedTime(member.createdTimestamp, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone }); const timeSinceCreated = formatDistance(member.createdTimestamp, Date.now(), { addSuffix: true });

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

            ${message?.guild ? '*This user is not a member of the server. No additional info is available.*' : "*No more information is available in DM's*"}`);
            embed.setFooter({ text: `ID: ${member.id}` });
        }

        // Send the embed
        message.reply({ embeds: [embed] });
    },
};
