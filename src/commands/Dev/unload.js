const command = require("../../modules/handlers/command");
const event = require("../../modules/handlers/event");
const task = require("../../modules/handlers/task");

module.exports = {
    info: {
        name: "unload",
        aliases: [],
        usage: "unload [\"cmd\" | \"event\" | \"task\"] <name>",
        examples: [
            "unload ping",
            "unload event message",
            "unload task checkMojangStatus"
        ],
        description: "Unload a command.",
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
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the option
        const option = args[0].toLowerCase();

        if (!args[1] || option == "cmd") {
            // Get the command
            const cmdName = option == "cmd" ? args[1].toLowerCase() : option,
            cmd = bot.commands.get(cmdName) || bot.commands.get(bot.aliases.get(cmdName));

            // Return an error if a invalid command was specified
            if (!cmd)
                return message.error("You didn't specify a valid command to reload!");

            // Send a status message
            const msg = await message.loading(`Attempting to unload ${cmd.info.name}`);

            // Attempt to unload the command
            command.unload(bot, cmd).then(() => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully unloaded \`${cmd.info.name}\`!`);
                // Log that the command was unloaded
                bot.logger.log(`The command ${cmd.info.name} was unloaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to unload the command: \`${err.message}\`!`);
            });
        } else if (option == "event") {
            // Send a status message
            const msg = await message.loading(`Attempting to unload the \`${args[1].toLowerCase()}\` event.`);

            // Attempt to unload the event
            event.unload(bot, args[1]).then((res) => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully unloaded the \`${res}\` event!`);
                // Log that the event was unloaded
                bot.logger.log(`The event ${res} was unloaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to unload the event: \`${err.message}\`!`);
            });
        } else if (option == "task") {
            // Send a status message
            const msg = await message.loading(`Attempting to unload the \`${args[1].toLowerCase()}\` task.`);

            // Attempt to unload the task
            task.unload(bot, args[1]).then((res) => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully unloaded the \`${res}\` task!`);
                // Log that the task was unloaded
                bot.logger.log(`The task ${res} was unloaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to unload the task: \`${err.message}\`!`);
            });
        }

    }
};