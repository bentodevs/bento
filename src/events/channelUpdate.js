import { stripIndents } from 'common-tags';
import { formatDuration, intervalToDuration } from 'date-fns';
import { MessageEmbed } from 'discord.js';
import settings from '../database/models/settings.js';

export default async (bot, oldChannel, newChannel) => {
    // If channel type is DM, then ignore
    if (newChannel.type === 'DM') return;

    const sets = await settings.findOne({ _id: newChannel.guild.id });

    if (sets.manual_events?.channels) {
        // Fetch the manual event log channel
        const log = newChannel.guild.channels.cache.get(sets.logs.events);

        // If there is no log channel, return
        if (!log) return;

        // Define the description string
        let desc = '';

        // Channel name update
        if (newChannel.name !== oldChannel.name) desc += `__**Channel Name:**__\n**Old Name:** ${oldChannel.name}\n**New Name:** ${newChannel.name}\n\n`;
        // Channel type update
        if (newChannel.type !== oldChannel.type) desc += `__**Channel Type:**__\n**Old Type:** ${oldChannel.type.toTitleCase()}\n**New Type:** ${newChannel.type.toTitleCase()}\n\n`;
        // Channel NSFW state update
        if (newChannel?.nsfw !== oldChannel?.nsfw) desc += `__**NSFW Status:**__\n**Old State:** ${oldChannel.nsfw ? 'Enabled' : 'Disabled'}\n**New State:** ${newChannel.nsfw ? 'Enabled' : 'Disabled'}\n\n`;
        // Channel Parent update
        if (newChannel.parentID !== oldChannel.parentID) desc += `__**Channel Parent:**__\n**Old Parent:** ${newChannel.guild.channels.cache.get(oldChannel.parentID) ?? 'None'}\n**New Name:** ${newChannel.guild.channels.cache.get(newChannel.parentID) ?? 'None'}\n\n`;
        // Channel slowmode update
        if (newChannel?.rateLimitPerUser !== oldChannel?.rateLimitPerUser) desc += `__**Slowmode:**__\n**Old Time:** ${oldChannel.rateLimitPerUser > 0 ? formatDuration(intervalToDuration({ start: 0, end: oldChannel.rateLimitPerUser * 1000 }), { delimiter: ', ' }) : 'Disabled'}\n**New Time:** ${newChannel.rateLimitPerUser > 0 ? formatDuration(intervalToDuration({ start: 0, end: newChannel.rateLimitPerUser * 1000 }), { delimiter: ', ' }) : 'Disabled'}\n\n`;
        // Channel bitrate update
        if (newChannel?.bitrate !== oldChannel?.bitrate) desc += `__**Bitrate (Voice Quality)**__\n**Old Bitrate:** ${oldChannel.bitrate / 1000}kbps\n**New Bitrate:** ${newChannel.bitrate / 1000}kbps\n\n`;

        // If the description is empty (I.e. we aren't interested in the update), then return
        if (!desc) return;

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`${newChannel.name} was modified`, newChannel.guild.iconURL({ dynamic: true, format: 'png' }))
            .setColor(bot.config.general.embedColor)
            .setDescription(stripIndents`${desc}`)
            .setFooter(`ID: ${newChannel.id}`)
            .setTimestamp();

        // Send the emebed to the log channel
        log.send({ embeds: [embed] });
    }
};
