const { load } = require("../../modules/handlers/command");

module.exports = {
    info: {
        name: "load",
        aliases: [],
        usage: "load <category> <command>",
        examples: [
            "load information ping"
        ],
        description: "Load a command.",
        category: "Dev",
        info: null,
        options: []
    },
    perms: {
        type: "dev",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: true,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // If the user didn't specify a command return an error
        if (!args[1])
            return message.error("You didn't specify a command!");

        // Send the status message
        const msg = await message.loading(`Attempting to load \`${args[1].toLowerCase()}\`!`);

        // Attempt to load the command
        load(bot, args[0], args[1]).then((props) => {
            // Edit the status message
            msg.edit(`${bot.config.emojis.confirmation} Successfully loaded \`${props.info.name}\`!`);
            // Log that the command has been loaded
            bot.logger.log(`The command ${props.info.name} was loaded by ${message.author.tag} (${message.author.id})`);
        }).catch(err => {
            // Edit the status message
            msg.edit(`${bot.config.emojis.error} Failed to load the command: \`${err.message}\`!`);
        });

    }
};