import { stripIndents } from 'common-tags';
import {
    Client, GuildMember, GuildTextBasedChannel, EmbedBuilder, Role,
} from 'discord.js';
import settings from '../database/models/settings.js';
import logger from '../logger';
import { DEFAULT_COLOR } from '../data/constants.js';

export default async (bot: Client, oldMember: GuildMember, newMember: GuildMember) => {
    // Fetch full user if partial
    // If the member is a partial fetch it
    if (newMember.partial) {
        try {
            await newMember.fetch();
        } catch (err) {
            return logger.error(err);
        }
    }

    // Fetch guild settings
    const sets = await settings.findOne({ _id: newMember.guild.id });

    // If the user was pending, and is now, then run the guildMemberAdd event
    // Yes, this is super lazy but it's also efficient, so :pepeshrug:
    if (oldMember.pending !== newMember.pending) {
        bot.emit('guildMemberAdd', newMember);
    }

    if (sets?.logs.members?.channel && sets?.logs.members.enabled) {
        // Fetch the manual event log channel™
        const log = newMember.guild.channels.cache.get(sets.logs.members.channel);

        // If there is no log channel, return
        if (!log) return;

        // Define the description string
        let desc = '';

        if (newMember.nickname !== oldMember.nickname) desc += `**__Nickname Updated__**\n**Old Nickname:** ${oldMember.nickname ?? 'None'}\n**New Nickname:** ${newMember.nickname ?? 'None'}\n\n`;
        // eslint-disable-next-line no-underscore-dangle
        if (JSON.stringify(newMember.roles) !== JSON.stringify(oldMember.roles)) desc += `**__Roles Updated__**\n**Old Roles:** ${oldMember.roles.cache.filter((role) => role.name !== '@everyone').sort((b, a) => a.position - b.position).map((role: Role) => role.toString()).join(', ')}\n**New Roles:** ${newMember.roles.cache.filter((role) => role.name !== '@everyone').sort((b, a) => a.position - b.position).map((role) => role.toString()).join(', ')}`;
        if (newMember.user.tag !== oldMember.user.tag) desc += `**__Username Updated__**\n**Old Username:**${oldMember.user.tag}\n**New Username:**${newMember.user.tag}\n\n`;
        if (newMember.user.displayAvatarURL() !== oldMember.user.displayAvatarURL()) desc += `**__Avatar Updated__**\n**Old Avatar:**[${oldMember.user.displayAvatarURL()}](Click here!)\n**New Avatar:**[${newMember.user.displayAvatarURL()}](Click here!)\n\n`;

        if (!desc) return;

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${newMember.user.tag} was modified`, iconURL: newMember.user.displayAvatarURL() })
            .setColor(newMember.displayColor ?? DEFAULT_COLOR)
            .setDescription(stripIndents`${desc}`)
            .setFooter({ text: `ID: ${newMember.user.id}` })
            .setTimestamp();

        // Send the emebed to the log channel
        (log as GuildTextBasedChannel).send({ embeds: [embed] });
    }
};
