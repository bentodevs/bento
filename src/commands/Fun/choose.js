module.exports = {
    info: {
        name: "choose",
        aliases: ["pick", "decide"],
        usage: "choose <options>",
        examples: [
            "choose 1 | 2 | 3",
            "choose heads | tails"
        ],
        description: "Randomly chooses an option for you.",
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

        // Split the options into an array
        const options = args.join(" ").split("|");

        // If no options were specified or all options are the same return an error
        if (options.every((val, i, arr) => val.trim() === arr[0].trim()))
            return message.error("You didn't really specify an options there?");

        // Choose a random option
        const choice = Math.floor((Math.random() * options.length));

        // Send the chosen option
        message.channel.send(`🤔 I choose ${options[choice].trim()}`);

    }
};