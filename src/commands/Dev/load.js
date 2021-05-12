const command = require("../../modules/handlers/command");
const event = require("../../modules/handlers/event");
const task = require("../../modules/handlers/task");

module.exports = {
    info: {
        name: "load",
        aliases: [],
        usage: "load [\"cmd\" | \"event\" | \"task\"] <name> [category]",
        examples: [
            "load ping information",
            "load event guildMemberAdd",
            "load task checkMojangStatus"
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

        // Get the option
        const option = args[0].toLowerCase();

        if (option == "event") {
            // Send a status message
            const msg = await message.loading(`Attempting to load the \`${args[1].toLowerCase()}\` event.`);

            // Attempt to load the event
            event.load(bot, args[1]).then((res) => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully loaded the \`${res}\` event!`);
                // Log that the event was loaded
                bot.logger.log(`The event ${res} was loaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to load the event: \`${err.message}\`!`);
            });
        } else if (option == "task") {
            // Send a status message
            const msg = await message.loading(`Attempting to load the \`${args[1].toLowerCase()}\` task.`);

            // Attempt to load the task
            task.load(bot, args[1]).then((res) => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully loaded the \`${res}\` task!`);
                // Log that the task was loaded
                bot.logger.log(`The task ${res} was loaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to load the task: \`${err.message}\`!`);
            });
        } else {
            // Get the command and the category
            const cmd = option == "cmd" ? args[1]?.toLowerCase() : option,
            category = option == "cmd" ? args[2]?.toLowerCase() : args[1].toLowerCase();

            // If no command was specified return an error
            if (!cmd)
                return message.error("You didn't specify a command!");
            // If no category was specified return an error
            if (!category)
                return message.error("You didn't specify a category!");

            // Send the status message
            const msg = await message.loading(`Attempting to load \`${cmd}\`!`);

            // Attempt to load the command
            command.load(bot, cmd, category).then((props) => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully loaded \`${props.info.name}\`!`);
                // Log that the command has been loaded
                bot.logger.log(`The command ${props.info.name} was loaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to load the command: \`${err.message}\`!`);
            });
        }

    }
};