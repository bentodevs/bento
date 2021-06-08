const { getDadjoke } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "dadjoke",
        aliases: ["djoke", "dj"],
        usage: "",
        examples: [],
        description: "Sends a random dad joke.",
        category: "Fun",
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

    run: async (bot, message) => {

        // Fetch a random joke from the api
        const data = await getDadjoke();

        // Send the joke
        message.reply(data.joke);

    }
};