module.exports = {
    info: {
        name: "rps",
        aliases: [],
        usage: "rps <\"rock\" | \"paper\" | \"scissors\">",
        examples: [
            "rps paper"
        ],
        description: "Play a game of rock paper scissors against R2-D2!",
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
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "option",
            type: "STRING",
            description: "Rock, paper or scissors.",
            required: true,
            choices: [
                { name: "Rock", value: "rock" },
                { name: "Paper", value: "paper" },
                { name: "Scissors", value: "scissors" }
            ]
        }]
    },

    run: async (bot, message, args) => {

        // Define the different options & formatted versions of them
        const options = [
            "scissors",
            "rock",
            "paper"
        ],
        formatted = [
            "scissors ✌️",
            "rock ✊",
            "paper ✋"
        ];

        // If the user specified an invalid option return an error
        if (!options.includes(args[0].toLowerCase()))
            return message.errorReply("You didn't specify a valid option! Please enter `rock`, `paper` or `scissors`!");

        // Get the userPick and the botPick
        const userPick = options.indexOf(args[0].toLowerCase()),
        botPick = Math.floor(Math.random() * 3);

        // Check who won
        if (userPick == botPick) {
            return message.reply(`I chose **${formatted[botPick]}**, its a draw!`);
        } else if (botPick > userPick || botPick == 0 && userPick == 2) {
            message.reply(`I chose **${formatted[botPick]}**, I win!`);
        } else {
            message.reply(`I chose **${formatted[botPick]}**, you win!`);
        }

    },

    run_interaction: async (bot, interaction) => {

        // Define the different options & formatted versions of them
        const options = [
            "scissors",
            "rock",
            "paper"
        ],
        formatted = [
            "scissors ✌️",
            "rock ✊",
            "paper ✋"
        ];

        // Get the userPick and the botPick
        const userPick = options.indexOf(interaction.options.get("option").value),
        botPick = Math.floor(Math.random() * 3);

        // Check who won
        if (userPick == botPick) {
            return interaction.reply(`I chose **${formatted[botPick]}**, its a draw!`);
        } else if (botPick > userPick || botPick == 0 && userPick == 2) {
            interaction.reply(`I chose **${formatted[botPick]}**, I win!`);
        } else {
            interaction.reply(`I chose **${formatted[botPick]}**, you win!`);
        }

    }
};