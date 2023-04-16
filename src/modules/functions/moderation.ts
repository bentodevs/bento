import { stripIndents } from 'common-tags';
import {
    Client, EmbedBuilder, GuildMember, Interaction, PermissionFlagsBits, User,
} from 'discord.js';
import { default as settingsDb } from '../../database/models/settings';
import { getSettings } from '../../database/mongo';
import { PunishmentType } from '../../types/dbTypes';
import { DEFAULT_COLOR, OWNERS } from '../../data/constants';

export const punishmentLog = (
    bot: Client,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interaction: any,
    _member: User | GuildMember,
    punishmentId: number,
    reason: string,
    type: PunishmentType,
    length?: string,
) => {
    let member: User;

    if (_member instanceof User) {
        member = _member;
    } else {
        member = _member.user;
    }

    // Create new embed
    const embed = new EmbedBuilder()
        .setColor(DEFAULT_COLOR)
        .setThumbnail(member.displayAvatarURL())
        .setFooter({ text: `User ID: ${member.id}` })
        .setTimestamp();

    // Create new desctiprion string
    const description = `**User:** ${member} (\`${member.id}\`)
    **Moderator:** ${interaction.user} (\`${interaction.user.id}\`)`;

    switch (type) {
        case 'BAN':
            embed.setAuthor({ name: `Case ${punishmentId} | User Banned`, iconURL: member.displayAvatarURL() });
            embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
            break;
        case 'KICK':
            embed.setAuthor({ name: `Case ${punishmentId} | User Kicked`, iconURL: member.displayAvatarURL() });
            embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
            break;
        case 'MUTE':
            embed.setAuthor({ name: `Case ${punishmentId} | User Muted`, iconURL: member.displayAvatarURL() });
            embed.setDescription(stripIndents`${description}
            **Length:** ${length}
            **Reason:** ${reason}`);
            break;
        case 'UNMUTE':
            embed.setAuthor({ name: `Case ${punishmentId} | User Unmuted`, iconURL: member.displayAvatarURL() });
            embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
            break;
        case 'UNBAN':
            embed.setAuthor({ name: `Case ${punishmentId} | User Unbanned`, iconURL: member.displayAvatarURL() });
            embed.setDescription(stripIndents`${description}
            **Reason:** ${reason}`);
            break;
        default:
            throw new TypeError('Invalid punishment type');
    }

    return embed;
};

/**
 * Check if the user running the command is blacklisted
 *
 * @param {Interaction} interaction The message (or interaction) object from which to get certain data (Such as guild ID, etc.)
 *
 * @returns {Promise.<Boolean>} True if blacklisted, false if not blacklisted.
 */
export const checkBlacklist = async (interaction: Interaction): Promise<boolean> => {
    if (!interaction.inGuild()) return false;

    // Get the interaction user
    const settings = await getSettings(interaction.guildId);
    const { member, user } = interaction;

    if (settings.blacklist.users.includes(user.id)
        || settings.blacklist.roles.filter((a) => (member as GuildMember).roles.cache.has(a)).length) {
        // Define the blacklisted var
        let blacklisted = true;

        // Get the hierarchic role
        const hierarchicRole = interaction.guild?.roles.cache.get(settings.blacklist.bypassHierachicRole);

        // If the hierarchic role doesn't exist anymore remove it from the settings db
        if (!hierarchicRole && settings.blacklist.bypassHierachicRole) {
            await settingsDb.findOneAndUpdate({ _id: interaction.guildId }, { 'blacklist.bypassHierachicRole': null });

            blacklisted = false;
        }

        // If the users role is higher or equal to the hierarchic role set blacklisted to false
        if (hierarchicRole && (member as GuildMember).roles.highest.position >= hierarchicRole.position) blacklisted = false;

        // If the user has a bypass role set blacklisted to false
        if (settings.blacklist.bypassRoles.length) {
            for (const data of settings.blacklist.bypassRoles) {
                if ((member as GuildMember).roles.cache.has(data)) blacklisted = false;
            }
        }

        // If the user has ADMINISTRATOR permissions or is a bot dev set blacklisted to false
        if ((member as GuildMember).permissions.has(PermissionFlagsBits.Administrator) || OWNERS.includes(user.id)) blacklisted = false;

        // Return the blacklisted variable
        return blacklisted;
    }
    // Return false
    return false;
};
