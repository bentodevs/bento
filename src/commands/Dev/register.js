module.exports = {
    info: {
        name: "register",
        aliases: [],
        usage: "",
        examples: [],
        description: "",
        category: "Dev",
        info: null,
        options: []
    },
    perms: {
        permission: "",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: true,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the command
        const cmdName = args[0].toLowerCase() == "cmd" ? args[1].toLowerCase() : args[0].toLowerCase(),
        cmd = bot.commands.get(cmdName) || bot.commands.get(bot.aliases.get(cmdName));

        if (!cmd)
            return message.error("You didn't specify a valid command!");

        const data = {
            name: cmd.info.name,
            description: cmd.info.description,
            options: cmd.slash?.opts ?? []
        };

        await message.guild.commands.create(data);

        message.confirmation("Successfully registered that command!");

    }
}; 