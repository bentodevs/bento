const settings = require("../../database/models/settings");

module.exports = {
    info: {
        name: "enable",
        aliases: [],
        usage: "enable <command | category>",
        examples: [
            "enable ping",
            "enable moderation"
        ],
        description: "Enable specific bot commands or categories.",
        category: "Settings",
        info: "",
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get all the command categories
        const getCategories = bot.commands.map(c => c.info.category.toLowerCase()),
        categories = getCategories.filter((item, index) => {
            return getCategories.indexOf(item) >= index;
        });

        // Get the command or category that the user specified
        const target = args.join(" ").toLowerCase(),
        command = bot.commands.get(target) || bot.commands.get(bot.aliases.get(target)),
        category = categories[categories.indexOf(target)];

        // Check if the user specified a valid command or category
        if (!command && !category)
                return message.error("You didn't specify a valid command or category!");

        if (command) {
            // If the command is already enabled send an error message
            if (!message.settings.general.disabled_commands.includes(command.info.name))
                return message.error("The command you specified is already enabled!");

            // Remove the command from the disabled_commands array
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $pull: { "general.disabled_commands": command.info.name }
            });

            // Send a confirmation message
            message.confirmation(`The command \`${command.info.name}\` has been enabled!`);
        } else if (category) {
            // If the category is already enabled send an error message
            if (!message.settings.general.disabled_categories.includes(category))
                return message.error("The category you specified is already enabled!");

            // Remove the category from the disabled_categories array
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $pull: { "general.disabled_categories": category }
            });

            // Send a confirmation message
            message.confirmation(`The category \`${category}\` has been enabled!`);
        }

    }
};