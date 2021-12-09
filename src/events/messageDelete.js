import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import settings from '../database/models/settings.js';
import { getChannel } from '../modules/functions/getters.js';

export default async (bot, message) => {
    // If the message is partial try to fetch it before its fully deleted on discords side
    if (message.partial) {
        try {
            await message.fetch();
        } catch {
            return;
        }
    }

    // If the author is a bot return
    if (message.author.bot) return;
    // If the message was in dms return
    if (message.channel.type === 'DM') return;

    // Get the guild settings
    const msgSettings = await settings.findOne({ _id: message.guild.id });

    // Get the audit log entry for the deleted message
    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' })
        .then((audit) => audit.entries.first())
        .catch(() => { });

    // Create the msg object
    const msg = {
        channel: message.channel.id,
        author: {
            id: message.author.id,
            tag: message.author.tag,
        },
        content: message.content,
        id: message.id,
        deletedTimestamp: Date.now(),
    };

    // Add the deletedMsg to the collection
    bot.deletedMsgs.set(`${message.guild.id}-${message.channel.id}`, msg);

    // If the log channel exists, then send to the log channel
    if (msgSettings.logs?.deleted) {
        // Define user
        let user;

        // Find who deleted the message
        if (entry?.extra.channel.id === message.channel.id && (entry?.target.id === message.author.id) && (entry?.createdTimestamp > (Date.now() - 5000)) && (entry?.extra.count >= 1)) {
            user = `**Deleted by:** ${entry.executor.toString()}`;
        } else {
            user = '**Deleted by:** The author or a bot';
        }

        // Get the log channel
        const channel = await getChannel(message, msgSettings.logs.deleted, false);

        console.log(message.attachments);

        const embed = new MessageEmbed()
            .setAuthor(`Message by ${message.author.tag} deleted in #${message.channel.name}`, message.author.displayAvatarURL({ format: 'png', dynamic: true }))
            .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true }))
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`**User:** ${message.author} (\`${message.author.id}\`)
            **Message ID:** \`${message.id}\`
            ${user}`)
            .setTimestamp();

        if (message.content) embed.addField('Message', message.content);
        if (message.attachments.size > 0) embed.addField('Attachments', message.attachments.map((a) => a.proxyURL).join('\n'));

        channel?.send({ embeds: [embed] });
    }
};
