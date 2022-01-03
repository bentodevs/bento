import { stripIndents } from 'common-tags';
import { MessageEmbed, Permissions } from 'discord.js';
import config from '../../config.js';
import settings from '../../database/models/settings.js';

export const punishmentLog = (bot, message, member, punishmentId, reason, type, length) => {
    const punishmentTypes = ['ban', 'kick', 'mute', 'unmute', 'unban', 'warn'];

    // Create new embed
    const embed = new MessageEmbed()
        .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
        .setThumbnail((member?.author ?? member).displayAvatarURL({ format: 'png', dynamic: true }))
        .setFooter({ text: `User ID: ${member.id}` })
        .setTimestamp();

    // Create new desctiprion string
    const description = `**User:** ${member} (\`${member.id}\`)
    **Moderator:** ${message?.author ?? message.user} (\`${(message?.author ?? message.user).id}\`)`;

    switch (type) {
    case 'ban':
        embed.setAuthor({ name: `Case ${punishmentId} | User Banned`, iconURL: (member?.user ?? member).displayAvatarURL({ format: 'png', dynamic: true }) });
        embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
        break;
    case 'kick':
        embed.setAuthor({ name: `Case ${punishmentId} | User Kicked`, iconURL: (member?.user ?? member).displayAvatarURL({ format: 'png', dynamic: true }) });
        embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
        break;
    case 'mute':
        embed.setAuthor({ name: `Case ${punishmentId} | User Muted`, iconURL: (member?.user ?? member).displayAvatarURL({ format: 'png', dynamic: true }) });
        embed.setDescription(stripIndents`${description}
            **Length:** ${length}
            **Reason:** ${reason}`);
        break;
    case 'unmute':
        embed.setAuthor({ name: `Case ${punishmentId} | User Unmuted`, iconURL: (member?.user ?? member).displayAvatarURL({ format: 'png', dynamic: true }) });
        embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
        break;
    case 'unban':
        embed.setAuthor({ name: `Case ${punishmentId} | User Unbanned`, iconURL: (member?.user ?? member).displayAvatarURL({ format: 'png', dynamic: true }) });
        embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
        break;
    default:
        throw new Error(`Invalid punishment type - Must be one of ${punishmentTypes.join(', ')}`);
    }

    return embed;
};

// eslint-disable-next-line no-shadow
export const checkMessage = async (message, settings) => {
    if (settings.ignore?.hierarchicRoleId && message.guild.roles.cache.get(settings.ignore?.hierarchicRoleId).position <= message.member.roles.highest.position) return;
    if (settings.ignore?.channels.includes(message.channel.id) || settings.ignore?.roles.includes(message.member.roles.cache) || message.member.permissions.has('ADMINISTRATOR')) return;

    if (settings.moderation?.filter?.state) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        for (const data of settings.moderation.filter?.entries) {
            if (message.content.toLowerCase().includes(data.toLowerCase())) {
                message.delete()
                    .then(() => message.reply(`You are unable to say that here, ${message.author}!`))
                    .then((m) => setTimeout(() => m.delete().catch(() => { }), 7000))
                    .catch(() => { });
            }
        }
    }

    if (settings.moderation?.filter?.zalgo) {
        const zalgo = /[\xCC\xCD]/;
        if (zalgo.test(message.content)) {
            message.delete()
                .then(() => message.reply(`You are unable to use Zalgo text here, ${message.author}!`))
                .then((m) => setTimeout(() => m.delete().catch(() => { }), 7000))
                .catch(() => { });
        }
    }

    if (settings.moderation?.no_invite) {
        const invite = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g;

        if (invite.test(message.content)) {
            message.delete()
                .then(() => message.channel.send(`You are unable to send invite links here, ${message.author}!`))
                .then((m) => setTimeout(() => m.delete().catch(() => { }), 7000))
                .catch(() => { });
        }
    }

    if (settings.moderation?.no_link) {
        const link = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;

        if (link.test(message.content)) {
            message.delete()
                .then(() => message.channel.send(`You are unable to send links here, ${message.author}!`))
                .then((m) => setTimeout(() => m.delete().catch(() => { }), 7000))
                .catch(() => { });
        }
    }
};

/**
 * Check if the user running the command is blacklisted
 *
 * @param {Object} message The message (or interaction) object from which to get certain data (Such as guild ID, etc.)
 *
 * @returns {Promise.<Boolean>} True if blacklisted, false if not blacklisted.
 */
export const checkBlacklist = async (message) => {
    // Get the author (to support interactions)
    const author = message.author ?? message.user;

    if (message.settings.blacklist.users.includes(author.id) || message.settings.blacklist.channels.includes(author.id) || message.settings.blacklist.roles.filter((a) => message.member.roles.cache.has(a)).length) {
        // Define the blacklisted var
        let blacklisted = true;

        // Get the hierarchic role
        const hierarchicRole = message.guild.roles.cache.get(message.settings.blacklist.bypass.hierarchicRoleId);

        // If the hierarchic role doesn't exist anymore remove it from the settings db
        if (!hierarchicRole && message.settings.blacklist.bypass.hierarchicRoleId) {
            await settings.findOneAndUpdate({ _id: message.guild.id }, { 'blacklist.bypass.hierarchicRoleId': null });

            blacklisted = false;
        }

        // If the users role is higher or equal to the hierarchic role set blacklisted to false
        if (hierarchicRole && message.member.roles.highest.position >= hierarchicRole.position) blacklisted = false;

        // If the user has a bypass role set blacklisted to false
        if (message.settings.blacklist.bypass.roles.length) {
            for (const data of message.settings.blacklist.bypass.roles) {
                if (message.member.roles.cache.has(data)) blacklisted = false;
            }
        }

        // If the user has ADMINISTRATOR permissions or is a bot dev set blacklisted to false
        if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || config.general.devs.includes(author.id)) blacklisted = false;

        // Return the blacklisted variable
        return blacklisted;
    }
    // Return false
    return false;
};
