module.exports = {
    info: {
        name: "premium",
        aliases: ["pro", "subscription"],
        usage: "",
        examples: [],
        description: "Check your premium status.",
        category: "Miscellaneous",
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
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: []
    },

    run: async (bot, message, args) => {

        // Send a message
        message.reply(`${bot.config.emojis.confirmation} Premium is currently free and enabled for all users during the **beta** of R2-D2. Once the bot is ready to come out of its beta stage, premium will be a paid subscription.`);

    }
};