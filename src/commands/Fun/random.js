module.exports = {
    info: {
        name: "random",
        aliases: [
            "number",
            "randomnumer"
        ],
        usage: "random [number]",
        examples: [
            "random 100",
            "random 10"
        ],
        description: "Picks a random number between 1 and the number you specify.",
        category: "Fun",
        info: "If no number is specified it will default to 100.",
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
        opts: [{
            name: "number",
            type: "INTEGER",
            description: "A number between 1 and 1,000,000,000,000.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // Conver the string to a number
        let number = parseInt(args[0]);

        // If the user specifies a invalid number return an error
        if (args[0] && !number)
            return message.error("You didn't specify a valid number!");
        // If no number was specified default to 100
        if (!args[0])
            number = 100;
        // If the number is 0 or lower return an error
        if (number <= 0)
            return message.error("Please enter a number above 0!");
        // If the number is above 1 trillion return an error
        if (number > 1000000000000)
            return message.error("Please enter a number below **1,000,000,000,000**!");

        // Get the random number
        const result = Math.floor(Math.random() * number + 1);

        // Send the random number
        message.confirmation(`The random number I picked is **${result.toLocaleString()}**!`);

    },

    run_interaction: async (bot, interaction) => {

        // Get the number
        const number = interaction.options.get("number")?.value ?? 100;

        // If the number is 0 or lower return an error
        if (number <= 0)
            return interaction.error("Please enter a number above 0!");
        // If the number is above 1 trillion return an error
        if (number > 1000000000000)
            return interaction.error("Please enter a number below **1,000,000,000,000**!");

        // Get the random number
        const result = Math.floor(Math.random() * number + 1);

        // Send the random number
        interaction.confirmation(`The random number I picked is **${result.toLocaleString()}**!`);

    }
};