module.exports = {
    info: {
        name: "roll",
        aliases: [
            "dice",
            "r"
        ],
        usage: "roll [sides]",
        examples: [
            "roll 6",
            "roll 20"
        ],
        description: "Rolls a dice with the specified number of sides.",
        category: "Fun",
        info: "If no number is specified it will default to 6 sides.",
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

    run: async (bot, message, args) => {

        // Convert the string to a number
        let number = parseInt(args[0]);

        // If an invalid number was specified return an error
        if (args[0] && !number)
            return message.error("You didn't specify a valid number!");
        // If no number was specified default to 6
        if (!args[0])
            number = 6;
        // If the number is 0 or lower return an error
        if (number <= 0)
            return message.error("Please enter a number above 0!");
        // If the number is above 1 trillion return an error
        if (number > 1000000000000)
            return message.error("Please enter a number below **1,000,000,000,000**!");

        // Get the result
        const result = Math.floor(Math.random() * number + 1);

        // Send the result
        message.confirmation(`You rolled a **${result}**!`);

    }
};