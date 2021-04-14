const { exec } = require("child_process");

module.exports = {
    info: {
        name: "git",
        aliases: [],
        usage: "git <command>",
        examples: [
            "git pull",
            "git status"
        ],
        description: "Run a git command.",
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

        // Send a status message
        const msg = await message.loading(`Running the command: \`git ${args.join(" ")}\``);

        // Run the command
        exec(`git ${args.join(" ")}`, (err, stdout) => {
            if (err) {
                // Update the message with an error
                msg.edit(`${bot.config.emojis.error} It looks like I encountered an error running the command: \`${err.message}\``);
                // Log the error
                bot.logger.error(err.stack);
            } else {
                // Delete the status message
                msg.delete().catch(() => {});
                // Send the output
                message.channel.send(stdout, { code: "xl", split: { maxLenght: "1800" } });
            }
        });

    }
};