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
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "user",
            type: "USER",
            description: "The user you want to send the message as.",
            required: true
        }, {
            name: "message",
            type: "STRING",
            description: "The message you want the user to send.",
            required: true
        }]
    },


    run: async (bot, message, args) => {

        // Get the emember
        const member = await getMember(message, args[0]);

        // If no member was found return an error
        if (!member)
            return message.errorReply("You didn't specify a valid member!");
        // If the member is a bot dev return an error
        if (bot.config.general.devs.includes(member.id))
            return message.errorReply("You cannot use this command on that member!");
        // If the member is a bot return an error
        if (member.user.bot)
            return message.errorReply("You cannot use this command on bots!");
        // If the members display name is shorter than 2 characters return an error
        if (member.displayName.length < 2)
            return message.errorReply("The name of the member you specified is shorter than 2 characters!");
        // If no message was specified return an error
        if (!args[1])
            return message.errorReply("You didn't specify a message to send!");

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
        }).catch(err => {
            // Log the error
            console.error(err);
            // Send an error message
            message.errorReply(`Something went wrong: \`${err.message}\`!`);
        });

    },

    run_interaction: async (bot, interaction) => {

        // Get the member
        const member = interaction.options.get("user")?.member;

        // If no member was found return an error
        if (!member)
            return interaction.error("You didn't specify a valid member!", { ephemeral: true });
        // If the member is a bot dev return an error
        if (bot.config.general.devs.includes(member.id))
            return interaction.error("You cannot use this command on that member!", { ephemeral: true });
        // If the member is a bot return an error
        if (member.user.bot)
            return interaction.error("You cannot use this command on bots!", { ephemeral: true });
        // If the members display name is shorter than 2 characters return an error
        if (member.displayName.length < 2)
            return interaction.error("The name of the member you specified is shorter than 2 characters!", { ephemeral: true });

        // Create the webhook
        interaction.channel.createWebhook(member.displayName, {
            avatar: member.user.displayAvatarURL({ format: "png", dynamic: true }),
            reason: `Fake Command | Ran By: ${interaction.user.tag}`
        }).then(async hook => {
            // Send the message
            await hook.send(interaction.options.get("message").value);
            // Delete the webhook
            hook.delete();
        }).catch(err => {
            // Log the error
            console.error(err);
            // Send an error message
            interaction.error(`Something went wrong: \`${err.message}\`!`, { ephemeral: true });
        });

        // Send the user a confirmation message
        interaction.reply(`Successfully sent the fake message as ${member}!`, { ephemeral: true });

    }
};