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
            return message.error("You didn't specify a valid option! Please enter `rock`, `paper` or `scissors`!");

        // Get the userPick and the botPick
        const userPick = options.indexOf(args[0].toLowerCase()),
        botPick = Math.floor(Math.random() * 3);

        // Check who won
        if (userPick == botPick) {
            return message.channel.send(`I chose **${formatted[botPick]}**, its a draw!`);
        } else if (botPick > userPick || botPick == 0 && userPick == 2) {
            message.channel.send(`I chose **${formatted[botPick]}**, I win!`);
        } else {
            message.channel.send(`I chose **${formatted[botPick]}**, you win!`);
        }
               
    }
};