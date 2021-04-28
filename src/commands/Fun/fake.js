const { getMember } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "fake",
        aliases: [],
        usage: "fake <user> <message>",
        examples: [
            "fake @Waitrose hi"
        ],
        description: "Send a message as another user.",
        category: "Fun",
        info: null,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: [
            "MANAGE_CHANNELS"
        ]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the emember
        const member = await getMember(message, args[0]);

        // If no member was found return an error
        if (!member)
            return message.error("You didn't specify a valid member!");
        // If the member is a bot dev return an error
        if (bot.config.general.devs.includes(member.id))
            return message.error("You cannot use this command on that member!");
        // If the member is a bot return an error
        if (member.user.bot)
            return message.error("You cannot use this command on bots!");
        // If the members display name is shorter than 2 characters return an error
        if (member.displayName.length < 2)
            return message.error("The name of the member you specified is shorter than 2 characters!");
        // If no message was specified return an error
        if (!args[1])
            return message.error("You didn't specify a message to send!");

        // Delete the authors message
        await message.delete().catch(() => {});

        // Create the webhook
        message.channel.createWebhook(member.displayName, {
            avatar: member.user.displayAvatarURL({ format: "png", dynamic: true }),
            reason: `Fake Command | Ran By: ${message.author.tag}`
        }).then(async hook => {
            // Send the message
            await hook.send(args.slice(1).join(" "));
            // Delete the webhook
            hook.delete();
        });

    }
};