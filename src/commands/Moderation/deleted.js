const { MessageEmbed } = require("discord.js");
const { getChannel, getUser, getMember } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "deleted",
        aliases: [],
        usage: "deleted [channel]",
        examples: [
            "deleted #general"
        ],
        description: "Shows the latest deleted message in a channel.",
        category: "Moderation",
        info: "R2-D2 only stores this information until the bot restarts.",
        options: []
    },
    perms: {
        permission: "MANAGE_MESSAGES",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        const channel = await getChannel(message, args.join(" "), true),
        deleted = bot.deletedMsgs.get(`${message.guild.id}-${channel?.id}`);

        if (!channel)
            return message.error("You didn't specify a valid channel!");
        if (!deleted)
            return message.error(`I don't remember any deleted messages for ${channel.id == message.channel.id ? "this" : "that"} channel!`);

        const user = await getUser(bot, message, deleted.author.id),
        member = await getMember(message, deleted.author.id);

        const embed = new MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL({ format: "png", dynamic: true }))
            .setDescription(deleted.content)
            .setColor(member?.displayColor ?? bot.config.general.embedColor)
            .setFooter(deleted.id)
            .setTimestamp(deleted.deletedTimestamp);

        message.channel.send({ embeds: [embed] });
        
    }
};