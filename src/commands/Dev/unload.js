const { unload } = require("../../modules/handlers/command");

module.exports = {
    info: {
        name: "unload",
        aliases: [],
        usage: "unload <command>",
        examples: [
            "unload ping"
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

        // Get the command
        const cmdName = args[0].toLowerCase(),
        cmd = bot.commands.get(cmdName) || bot.commands.get(bot.aliases.get(cmdName));

        // Return an error if a invalid command was specified
        if (!cmd)
            return message.error("You didn't specify a valid command to reload!");

        // Send a status message
        const msg = await message.loading(`Attempting to unload ${cmd.info.name}`);

        // Attempt to unload the command
        unload(bot, cmd).then(() => {
            // Edit the status message
            msg.edit(`${bot.config.emojis.confirmation} Successfully unloaded \`${cmd.info.name}\`!`);
            // Log that the command was unloaded
            bot.logger.log(`The command ${cmd.info.name} was unloaded by ${message.author.tag} (${message.author.id})`);
        }).catch(err => {
            // Edit the status message
            msg.edit(`${bot.config.emojis.error} Failed to unload the command: \`${err.message}\`!`);
        });

    }
};