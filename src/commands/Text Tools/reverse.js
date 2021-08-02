module.exports = {
    info: {
        name: "reverse",
        aliases: ["rev"],
        usage: "reverse <text>",
        examples: [
            "reverse bald"
        ],
        description: "Reverses text.",
        category: "Text Tools",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: []
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
            name: "text",
            type: "STRING",
            description: "The text you want to reverse.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        // Check if the message isn't too long
        if ((args?.join(" ").length ?? message.options.get("text").value.length) >= 2000)
            return message.error("Your message was too long! Bots can only send messages with up to 2000 characters.");

        // Send the reversed text
        message.reply(args?.join(" ").reverseText() ?? message.options.get("text").value.reverseText());

    }
};