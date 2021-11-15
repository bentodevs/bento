const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const settings = require('../database/models/settings');

module.exports = async (bot, channel) => {
    // If channel type is DM, then ignore
    if (channel.type === 'DM') return;

    const sets = await settings.findOne({ _id: channel.guild.id });

    if (sets.manual_events?.channels) {
        // Fetch the manual event log channel
        const log = channel.guild.channels.cache.get(sets.logs.events);

        // If there is no log channel, return
        if (!log) return;

        const embed = new MessageEmbed()
            .setAuthor(`${channel.name} was deleted`, channel.guild.iconURL({ dynamic: true, format: 'png' }))
            .setColor(bot.config.general.embedColor)
            .setDescription(stripIndents`**Channel:** ${channel} (\`${channel.id}\`)
            **Channel Type:** ${channel.type.toTitleCase()}`)
            .setFooter('Deleted at')
            .setTimestamp(channel.createdTimestamp);

        log.send({ embeds: [embed] });
    }
};
