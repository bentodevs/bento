import { stripIndents } from 'common-tags';
import { formatDuration, intervalToDuration } from 'date-fns';
import {
    Client, GuildBasedChannel, GuildTextBasedChannel, EmbedBuilder, TextChannel, VoiceBasedChannel,
} from 'discord.js';
import settings from '../database/models/settings.js';
import { DEFAULT_COLOR } from '../data/constants.js';
import { StringUtils } from '../utils/StringUtils.js';

export default async (bot: Client, oldChannel: GuildBasedChannel, newChannel: GuildBasedChannel) => {
    const sets = await settings.findOne({ _id: newChannel.guild.id });

    if (sets?.logs.channels.enabled && sets?.logs.channels.channel) {
        // Fetch the manual event log channel
        const log = newChannel.guild.channels.cache.get(sets.logs.channels.channel);

        // If there is no log channel, return
        if (!log) return;

        // Define the description string
        let desc = '';

        // Channel name update
        if (newChannel.name !== oldChannel.name) desc += `__**Channel Name:**__\n**Old Name:** ${oldChannel.name}\n**New Name:** ${newChannel.name}\n\n`;
        // Channel type update
        if (newChannel.type !== oldChannel.type) desc += `__**Channel Type:**__\n**Old Type:** ${StringUtils.toTitleCase(oldChannel.type.toString())}\n**New Type:** ${StringUtils.toTitleCase(newChannel.type.toString())}\n\n`;
        // Channel NSFW state update
        if ((newChannel as TextChannel)?.nsfw !== (oldChannel as TextChannel)?.nsfw) desc += `__**NSFW Status:**__\n**Old State:** ${(oldChannel as TextChannel).nsfw ? 'Enabled' : 'Disabled'}\n**New State:** ${(newChannel as TextChannel).nsfw ? 'Enabled' : 'Disabled'}\n\n`;
        // Channel Parent update
        if (newChannel.parentId !== oldChannel.parentId) desc += `__**Channel Parent:**__\n**Old Parent:** ${oldChannel.parentId ? newChannel.guild.channels.cache.get(oldChannel.parentId) : 'None'}\n**New Name:** ${newChannel.parentId ? newChannel.guild.channels.cache.get(newChannel.parentId) : 'None'}\n\n`;
        // Channel slowmode update
        if ((oldChannel as GuildTextBasedChannel)?.rateLimitPerUser !== (newChannel as GuildTextBasedChannel)?.rateLimitPerUser) {
            const oldRateLimit = (oldChannel as GuildTextBasedChannel)?.rateLimitPerUser;
            const newRateLimit = (newChannel as GuildTextBasedChannel)?.rateLimitPerUser;

            desc += `__**Slowmode:**__\n**Old Time:** ${(typeof oldRateLimit === 'number') && oldRateLimit > 0 ? formatDuration(intervalToDuration({ start: 0, end: oldRateLimit * 1000 }), { delimiter: ', ' }) : 'Disabled'}\n**New Time:** ${(typeof newRateLimit === 'number') && newRateLimit > 0 ? formatDuration(intervalToDuration({ start: 0, end: newRateLimit * 1000 }), { delimiter: ', ' }) : 'Disabled'}\n\n`;
        }
        // Channel bitrate update
        if ((newChannel as VoiceBasedChannel)?.bitrate !== (oldChannel as VoiceBasedChannel)?.bitrate) desc += `__**Bitrate (Voice Quality)**__\n**Old Bitrate:** ${(oldChannel as VoiceBasedChannel).bitrate / 1000}kbps\n**New Bitrate:** ${(newChannel as VoiceBasedChannel).bitrate / 1000}kbps\n\n`;

        // If the description is empty (I.e. we aren't interested in the update), then return
        if (!desc) return;

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${newChannel.name} was modified`, iconURL: newChannel.guild.iconURL() ?? '' })
            .setColor(DEFAULT_COLOR)
            .setDescription(stripIndents`${desc}`)
            .setFooter({ text: `ID: ${newChannel.id}` })
            .setTimestamp();

        // Send the emebed to the log channel
        (log as TextChannel).send({ embeds: [embed] });
    }
};
