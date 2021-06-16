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
        premium: false,
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "sides",
            type: "INTEGER",
            description: "A number between 1 and 1,000,000,000,000.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // TODO: [BOT-73] Make it so you can roll multiple dices at once

        // Convert the string to a number
        let number = parseInt(args[0]);

        // If an invalid number was specified return an error
        if (args[0] && !number)
            return message.errorReply("You didn't specify a valid number!");
        // If no number was specified default to 6
        if (!args[0])
            number = 6;
        // If the number is 0 or lower return an error
        if (number <= 0)
            return message.errorReply("Please enter a number above 0!");
        // If the number is above 1 trillion return an error
        if (number > 1000000000000)
            return message.errorReply("Please enter a number below **1,000,000,000,000**!");

        // Get the result
        const result = Math.floor(Math.random() * number + 1);

        // Send the result
        message.confirmationReply(`You rolled a **${result}**!`);

    },

    run_interaction: async (bot, interaction) => {

        // Get the number
        const number = interaction.options.get("sides")?.value ?? 6;
        
        // If the number is 0 or lower return an error
        if (number <= 0)
            return interaction.error("Please enter a number above 0!");
        // If the number is above 1 trillion return an error
        if (number > 1000000000000)
            return interaction.error("Please enter a number below **1,000,000,000,000**!");
    
        // Get the result
        const result = Math.floor(Math.random() * number + 1);
    
        // Send the result
        interaction.confirmation(`You rolled a **${result}**!`);

    }
};