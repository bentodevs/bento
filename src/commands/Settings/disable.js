const settings = require("../../database/models/settings");

module.exports = {
    info: {
        name: "disable",
        aliases: [],
        usage: "disable <command | category>",
        examples: [
            "disable ping",
            "disable moderation"
        ],
        description: "Disable specific bot commands or categories.",
        category: "Settings",
        info: "Users with the `ADMINISTRATOR` permission can still use these commands.",
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
        premium: false,
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
            // If the command is already disabled send an error message
            if (message.settings.general.disabled_commands.includes(command.info.name))
                return message.error("The command you specified is already disabled!");

            // Add the command to the disabled_commands array
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $addToSet: { "general.disabled_commands": command.info.name }
            });

            // Send a confirmation message
            message.confirmation(`The command \`${command.info.name}\` has been disabled!`);
        } else if (category) {
            // If the category is already disabled send an error message
            if (message.settings.general.disabled_categories.includes(category))
                return message.error("The category you specified is already disabled!");

            // Add the category to the disabled_categories array
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $addToSet: { "general.disabled_categories": category }
            });

            // Send a confirmation message
            message.confirmation(`The category \`${category}\` has been disabled!`);
        }

    }
};