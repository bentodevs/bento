const { MessageEmbed } = require("discord.js");
const { getChannel } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "embed",
        aliases: ["embedmsg"],
        usage: "embed [-s] <channel> | <title> | <description>",
        examples: [
            "embed -s epic embed",
            "embed #faq | some title | random description"
        ],
        description: "Embed a message",
        category: "Miscellaneous",
        info: null,
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
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        if (args[0].toLowerCase() === "-s") {
            // Join all args
            const text = args.join(" ").replace("-s", "").trim();

            // Build embed
            const embed = new MessageEmbed()
                .setColor(message.member?.displayHexColor ?? bot.config.general.embedColor)
                .setDescription(text);
        
            // Send the embed
            message.channel.send({ embeds: [embed] });
        } else {
            // Grab options
            const opts = args.join(" ").split("|");

            // Grab the channel, title and descriptions
            const channel = await getChannel(message, opts[0]?.trim()),
            title = opts[1]?.trim(),
            description = opts[2]?.trim();

            // If the channel, title or description wasn't specifed return an error
            if (!channel)
                return message.errorReply("You didn't specify a valid channel!");
            if (!title)
                return message.errorReply("You didn't specify a title!");
            if (!description)
                return message.errorReply("You didn't specify a description!");

            // Build the embed
            const embed = new MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setDescription(description)
                .setTitle(title);

            // Send the embed
            channel.send({ embeds: [embed] });

            message.confirmationReply("Successfully sent the embed!");
        }
    }
};