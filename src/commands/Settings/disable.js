const settings = require('../../database/models/settings');

module.exports = {
    info: {
        name: 'disable',
        aliases: [],
        usage: 'disable <command | category>',
        examples: [
            'disable ping',
            'disable moderation',
        ],
        description: 'Disable specific bot commands or categories.',
        category: 'Settings',
        info: 'Users with the `ADMINISTRATOR` permission can still use these commands.',
        options: [],
    },
    perms: {
        permission: 'ADMINISTRATOR',
        type: 'discord',
        self: [],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'target',
            type: 'STRING',
            description: 'The name of the command or category you want to disable.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // Get all the command categories
        const getCategories = bot.commands.map((c) => c.info.category.toLowerCase());
        const categories = getCategories.filter((item, index) => getCategories.indexOf(item) >= index);

        // Get the command or category that the user specified
        const target = args.join(' ').toLowerCase();
        const command = bot.commands.get(target) || bot.commands.get(bot.aliases.get(target));
        const category = categories[categories.indexOf(target)];

        // Check if the user specified a valid command or category
        if (!command && !category) return message.errorReply("You didn't specify a valid command or category!");
        // If the command/category is already disabled send an error message
        if (message.settings.general.disabled_commands.includes(command?.info.name) || message.settings.general.disabled_categories.includes(category)) return message.errorReply(`The ${command ? 'command' : 'category'} you specified is already disabled!`);

        // Get the DB query
        const toUpdate = command
            ? { $addToSet: { 'general.disabled_commands': command.info.name } }
            : { $addToSet: { 'general.disabled_categories': category } };

        // Update the setting
        await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

        // Send a confirmation message
        message.confirmationReply(`The ${command ? 'command' : 'category'} \`${command ? command.info.name : category}\` has been disabled!`);
    },

    run_interaction: async (bot, interaction) => {
        // Get all the command categories
        const getCategories = bot.commands.map((c) => c.info.category.toLowerCase());
        const categories = getCategories.filter((item, index) => getCategories.indexOf(item) >= index);

        // Get the command or category that the user specified
        const target = interaction.options.get('target').value;
        const command = bot.commands.get(target) || bot.commands.get(bot.aliases.get(target));
        const category = categories[categories.indexOf(target)];

        // Check if the user specified a valid command or category
        if (!command && !category) return interaction.error("You didn't specify a valid command or category!");
        // If the command/category is already disabled send an error message
        if (interaction.settings.general.disabled_commands.includes(command?.info.name) || interaction.settings.general.disabled_categories.includes(category)) return interaction.error(`The ${command ? 'command' : 'category'} you specified is already disabled!`);

        // Get the DB query
        const toUpdate = command
            ? { $addToSet: { 'general.disabled_commands': command.info.name } }
            : { $addToSet: { 'general.disabled_categories': category } };

        // Update the setting
        await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

        // Send a confirmation message
        interaction.confirmation(`The ${command ? 'command' : 'category'} \`${command ? command.info.name : category}\` has been disabled!`);
    },
};
