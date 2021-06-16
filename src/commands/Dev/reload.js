const command = require("../../modules/handlers/command");
const event = require("../../modules/handlers/event");
const task = require("../../modules/handlers/task");

const { readdirSync } = require("fs");

module.exports = {
    info: {
        name: "reload",
        aliases: [],
        usage: "reload [\"cmd\" | \"event\" | \"task\" | \"func\"] <name>",
        examples: [
            "reload ping",
            "reload event message",
            "reload task checkMojangStatus",
            "reload func getters"
        ],
        description: "Reload bot features.",
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
        premium: false,
        noArgsHelp: true,
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
                return message.errorReply("You didn't specify a valid command to reload!");

            // Send a status message
            const msg = await message.loadingReply(`Attempting to reload \`${cmd.info.name}\``);

            // Attempt to reload the command
            command.reload(bot, cmd).then(() => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully reloaded \`${cmd.info.name}\`!`);
                // Log that the command was reloaded
                bot.logger.log(`The command ${cmd.info.name} was reloaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to reload the command: \`${err.message}\`!`);
            });
        } else if (option == "event") {
            // Send a status message
            const msg = await message.loadingReply(`Attempting to reload the \`${args[1].toLowerCase()}\` event.`);

            // Attempt to reload the event
            event.reload(bot, args[1]).then((res) => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully reloaded the \`${res}\` event!`);
                // Log that the event was reloaded
                bot.logger.log(`The event ${res} was reloaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to reload the event: \`${err.message}\`!`);
            });
        } else if (option == "task") {
            // Send a status message
            const msg = await message.loadingReply(`Attempting to reload the \`${args[1].toLowerCase()}\` task.`);

            // Attempt to reload the task
            task.reload(bot, args[1]).then((res) => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.confirmation} Successfully reloaded the \`${res}\` task!`);
                // Log that the task was reloaded
                bot.logger.log(`The task ${res} was reloaded by ${message.author.tag} (${message.author.id})`);
            }).catch(err => {
                // Edit the status message
                msg.edit(`${bot.config.emojis.error} Failed to reload the task: \`${err.message}\`!`);
            });
        } else if (option == "func") {
            // Get all the function files and find the function specified
            const files = readdirSync("./modules/functions"),
            file = files.find(f => f.toLowerCase() == `${args[1].toLowerCase()}.js`);

            // If the file doesn't exist return an error
            if (!file)
                return message.errorReply("You didn't specify a valid functions file!");

            // Try to reload the file
            try {
                // Delete the file from the cache
                delete require.cache[require.resolve(`../../modules/functions/${file}`)];
                // Send a confirmation message
                message.confirmationReply(`Succesfully reloaded the \`${file.split(".")[0]}\` function!`);
            } catch (err) {
                // Log the error
                bot.logger.error(`Failed to reload ${file}`);
                bot.logger.error(err.stack);
                // Reject with the error
                return message.errorReply(`Failed to reload the function: \`${file.split(".")[0]}\`!`);
            }
        } else {
            // Send an error message
            message.errorReply("You didn't specify a valid option! Try one of these: `cmd`, `event`, `task` or `func`!");
        }

    }
};