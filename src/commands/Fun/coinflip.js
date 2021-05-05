module.exports = {
    info: {
        name: "coinflip",
        aliases: [
            "coin",
            "flip",
            "cf",
            "cflip",
            "cointoss"
        ],
        usage: "",
        examples: [],
        description: "Flips a coin.",
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
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message) => {
        // Get a random number between 0 and 1, if the number is 1 pick heads otherwise pick tails
        const random = Math.floor(Math.random() * 2),
        result = random == 1 ? "heads" : "tails";

        // Send a message with the result
        message.channel.send(`🪙 The coin landed on **${result}**!`);
    }
};