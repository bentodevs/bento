import { stripIndents } from 'common-tags';
import {
    Client, EmbedBuilder, GuildBasedChannel, TextChannel,
} from 'discord.js';
import settings from '../database/models/settings.js';
import { DEFAULT_COLOR } from '../modules/structures/constants.js';

export default async (bot: Client, channel: GuildBasedChannel) => {
    const sets = await settings.findOne({ _id: channel.guild.id });

    if (sets?.logs.channels.enabled && sets.logs.channels.channel) {
        // Fetch the manual event log channel
        const log = channel.guild.channels.cache.get(sets.logs.channels.channel);

        // If there is no log channel, return
        if (!log) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${channel.name} was deleted`, iconURL: channel.guild.iconURL() ?? '' })
            .setColor(DEFAULT_COLOR)
            .setDescription(stripIndents`**Channel:** ${channel} (\`${channel.id}\`)
            **Channel Type:** ${channel.type.toString()}`)
            .setFooter({ text: 'Deleted at' })
            .setTimestamp(channel.createdTimestamp);

        (log as TextChannel).send({ embeds: [embed] });
    }
};
