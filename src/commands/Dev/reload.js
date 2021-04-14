const { reload } = require("../../modules/handlers/command");

module.exports = {
    info: {
        name: "reload",
        aliases: [],
        usage: "reload <command>",
        examples: [
            "reload ping"
        ],
        description: "Reload commands.",
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

        // Get the command
        const cmdName = args[0].toLowerCase(),
        cmd = bot.commands.get(cmdName) || bot.commands.get(bot.aliases.get(cmdName));

        // Return an error if a invalid command was specified
        if (!cmd)
            return message.error("You didn't specify a valid command to reload!");

        // Send a status message
        const msg = await message.loading(`Attempting to reload ${cmd.info.name}`);

        // Attempt to reload the command
        reload(bot, cmd).then(() => {
            // Edit the status message
            msg.edit(`${bot.config.emojis.confirmation} Successfully reloaded \`${cmd.info.name}\`!`);
            // Log that the command was reloaded
            bot.logger.log(`The command ${cmd.info.name} was reloaded by ${message.author.tag} (${message.author.id})`);
        }).catch(err => {
            // Edit the status message
            msg.edit(`${bot.config.emojis.error} Failed to reload the command: \`${err.message}\`!`);
        });

    }
};