const settings = require('../../database/models/settings');

module.exports = {
    info: {
        name: 'prefix',
        aliases: [],
        usage: 'prefix [prefix | "default"]',
        examples: ['prefix .', 'prefix default'],
        description: 'Show or set the command prefix.',
        category: 'Settings',
        info: null,
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
            name: 'prefix',
            type: 'STRING',
            description: 'The prefix you want to set for this guild.',
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        if (!args[0]) {
            // Send the current prefix
            message.confirmationReply(`My prefix for this guild is \`${message.settings.general.prefix}\`!`);
        } else {
            // Get the new prefix
            let newPrefix = args.join(' ').toLowerCase();

            // If the user specified "default" set newPrefix as the default prefix
            if (newPrefix === 'default') newPrefix = bot.config.general.prefix;
            // If the user specified the same prefix that's already set return an error
            if (newPrefix === message.settings.general.prefix) return message.errorReply('The prefix you specified is already set as the current prefix!');

            // Update the prefix
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                'general.prefix': newPrefix,
            });

            // Send a confirmation message
            message.confirmationReply(`The prefix was successfully set to \`${newPrefix}\`!`);
        }
    },

    run_interaction: async (bot, interaction) => {
        if (!interaction.options?.get('prefix')?.value) {
            // Send the current prefix
            interaction.confirmation(`My prefix for this guild is \`${interaction.settings.general.prefix}\`!`);
        } else {
            // Get the new prefix
            let newPrefix = interaction.options.get('prefix').value.toLowerCase();

            // If the user specified "default" set newPrefix as the default prefix
            if (newPrefix === 'default') newPrefix = bot.config.general.prefix;
            // If the user specified the same prefix that's already set return an error
            if (newPrefix === interaction.settings.general.prefix) return interaction.error('The prefix you specified is already set as the current prefix!');

            // Update the prefix
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                'general.prefix': newPrefix,
            });

            // Send a confirmation message
            interaction.confirmation(`The prefix was successfully set to \`${newPrefix}\`!`);
        }
    },
};
