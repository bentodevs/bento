module.exports = {
    info: {
        name: "wordcount",
        aliases: [],
        usage: "wordcount <text>",
        examples: [
            "wordcount this is a test"
        ],
        description: "Counts the words and characters in a text.",
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
            description: "The text you want to be counted.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        // If there are no args get them from the interaction options
        if (!args) 
            args = message.options.get("text").value.split(/ +/g);

        // Send the counted text
        message.reply(`${bot.config.emojis.confirmation} The text you provided has **${args.length}** words and **${args.join("").length}** characters!`);

    }
};