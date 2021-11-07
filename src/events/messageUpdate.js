const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const settings = require("../database/models/settings");
const { getChannel } = require("../modules/functions/getters");
const { checkMessage } = require("../modules/functions/moderation");

module.exports = async (bot, oldMsg, newMsg) => {
    // If the message is partial return
    if (newMsg.partial)
        return;
    // If the author is a bot return
    if (newMsg.author.bot)
        return;
    // If only an embed updated return
    if (oldMsg.content == newMsg.content && oldMsg.embeds !== newMsg.embeds)
        return;
    // If the message is in a dm return
    if (oldMsg.channel.type === "DM")
        return;

    // Get the guild settings
    const msgSettings = await settings.findOne({ _id: newMsg.guild.id });

    // Logging code
    if (msgSettings.logs?.deleted) {

        // Get the log channel
        const channel = await getChannel(newMsg, msgSettings.logs.deleted, false);

        const embed = new MessageEmbed()
            .setAuthor(`Message by ${newMsg.author.tag} edited in #${newMsg.channel.name}`, newMsg.author.displayAvatarURL({ format: "png", dynamic: true }))
            .setThumbnail(newMsg.author.displayAvatarURL({ format: "png", dynamic: true }))
            .setColor(newMsg.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`**User:** ${newMsg.author} (\`${newMsg.author.id}\`)
            **Message ID:** \`${newMsg.id}\``)
            .addField(`Old Message Content`, oldMsg.content, true)
            .addField(`New Message Content`, newMsg.content, true)
            .setTimestamp();

        channel?.send({ embeds: [embed] });
    }

    // Run the new message through automod
    await checkMessage(newMsg, settings);
};