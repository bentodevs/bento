const { MessageEmbed } = require('discord.js');
const { getChannel, getUser, getMember } = require('../../modules/functions/getters');

module.exports = {
    info: {
        name: 'deleted',
        aliases: [],
        usage: 'deleted [channel]',
        examples: [
            'deleted #general',
        ],
        description: 'Shows the latest deleted message in a channel.',
        category: 'Moderation',
        info: 'R2-D2 only stores this information until the bot restarts.',
        options: [],
    },
    perms: {
        permission: 'MANAGE_MESSAGES',
        type: 'discord',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        // Grab the channel & the deleted message
        const channel = await getChannel(message, args.join(' '), true);
        const deleted = bot.deletedMsgs.get(`${message.guild.id}-${channel?.id}`);

        // If the channel wasn't found return an error
        if (!channel) return message.errorReply("You didn't specify a valid channel!");
        // If the deleted message wasn't found return an error
        if (!deleted) return message.errorReply(`I don't remember any deleted messages for ${channel.id === message.channel.id ? 'this' : 'that'} channel!`);

        // get the user and the member
        const user = await getUser(bot, message, deleted.author.id);
        const member = await getMember(message, deleted.author.id);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setDescription(deleted.content)
            .setColor(member?.displayColor ?? bot.config.general.embedColor)
            .setFooter(deleted.id)
            .setTimestamp(deleted.deletedTimestamp);

        // Send the embed
        message.reply({ embeds: [embed] });
    },
};
