import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import settings from '../database/models/settings.js';
import { checkMessage } from '../modules/functions/moderation.js';

export default async (bot, oldMsg, newMsg) => {
    // If the message is partial return
    if (newMsg.partial) return;
    // If the author is a bot return
    if (newMsg.author.bot) return;
    // If only an embed updated return
    if (oldMsg.content === newMsg.content && oldMsg.embeds !== newMsg.embeds) return;
    // If the message is in a dm return
    if (oldMsg.channel.type === 'DM') return;

    // Get the guild settings
    const msgSettings = await settings.findOne({ _id: newMsg.guild.id });

    // Logging code
    if (msgSettings.logs?.edited) {
        // Build the message embed
        const embed = new MessageEmbed()
            .setAuthor({ name: `Message by ${newMsg.author.tag} edited in #${newMsg.channel.name}`, iconUrl: newMsg.author.displayAvatarURL({ format: 'png', dynamic: true }) })
            .setThumbnail(newMsg.author.displayAvatarURL({ format: 'png', dynamic: true }))
            .setColor(newMsg.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`**User:** ${newMsg.author} (\`${newMsg.author.id}\`)
            **Message ID:** \`${newMsg.id}\``)
            .addField('Old Message Content', oldMsg.content, true)
            .addField('New Message Content', newMsg.content, true)
            .setTimestamp();

        newMsg.guild.channels.fetch(msgSettings.logs.edited)
            .then((channel) => channel.send({ embeds: [embed] }))
            .catch(async (err) => {
                if (msgSettings.logs.edited) {
                    await settings.findOneAndUpdate({ _id: newMsg.guild.id }, { 'logs.edited': null });
                } else {
                    bot.logger.error(err);
                }
            });
    }

    // Run the new message through automod
    await checkMessage(newMsg, settings);
};
