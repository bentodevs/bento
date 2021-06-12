const { MessageEmbed } = require("discord.js");
const { getChannel } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "editembed",
        aliases: [],
        usage: "editembed [-s] <channel> | <message id> | <title> | <description>",
        examples: [
            "editembed -s #general | 787235498162257921 | epic embed",
            "embed #faq | 787235498162257921 | some title | descriptions"
        ],
        description: "Add a embed to a bot message or update a embed.",
        category: "Miscellaneous",
        info: "Add `-s` as the first argument to edit the embed without the title option.",
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
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
            // Grab options
            const opts = args.join(" ").replace("-s", "").split("|");

            // Grab the channel, message and descriptions
            const channel = await getChannel(message, opts?.[0]?.trim()),
            msg = await channel?.messages.fetch(opts[1]?.trim()).catch(() => {}),
            description = opts?.slice(2)?.join(" ").trim();

            // If the channel wasn't specified or found return an error
            if (!channel)
                return message.errorReply("You didn't specify a valid channel!");
            // If the message wasn't specified or found return an error
            if (!msg)
                return message.errorReply("You didn't specify a valid message id!");
            // If the message isn't editable return an error
            if (!msg.editable)
                return message.errorReply("I cannot edit that message!");
            // If the description wasn't specified return an error
            if (!description)
                return message.errorReply("You didn't specify a description!");

            // Build the embed
            const embed = new MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setDescription(description);

            // Update the message with the embed
            msg.edit(embed);

            // Send a confirmation message
            message.confirmationReply("Successfully updated the embed!");
        } else {
            // Grab options
            const opts = args.join(" ").split("|");

            // Grab the channel, message, title and descriptions
            const channel = await getChannel(message, opts?.[0]?.trim()),
            msg = await channel?.messages.fetch(opts?.[1]?.trim()).catch(() => {}),
            title = opts?.[2]?.trim(),
            description = opts?.slice(3)?.join(" ").trim();

            // If the channel wasn't specified or found return an error
            if (!channel)
                return message.errorReply("You didn't specify a valid channel!");
            // If the message wasn't specified or found return an error
            if (!msg)
                return message.errorReply("You didn't specify a valid message id!");
            // If the message isn't editable return an error
            if (!msg.editable)
                return message.errorReply("I cannot edit that message!");
            // If the title wasn't specified return an error
            if (!title)
                return message.errorReply("You didn't specify a title!");
            // If the description wasn't specified return an error
            if (!description)
                return message.errorReply("You didn't specify a description!");

            // Build the embed
            const embed = new MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setDescription(description)
                .setTitle(title);

            // Update the message with the embed
            msg.edit(embed);

            // Send a confirmation message
            message.confirmationReply("Successfully updated the embed!");
        }
    }
};