const { MessageEmbed } = require('discord.js');
const settings = require('../../database/models/settings');

module.exports = {
    info: {
        name: 'filter',
        aliases: [],
        usage: 'filter [setting/page] [value]',
        examples: ['filter add badword', 'filter remove badword', 'filter list', 'filter list 2', 'filter toggle'],
        description: 'Manage the chat filter',
        category: 'Settings',
        info: null,
        options: [
            '`add <word/phrase>` - Add a word/phrase to the filter',
            '`remove <word/phrase>` - Remove a word/phrase from the filter',
            '`list [page]` - View the filtered words/phrases',
            '`toggle` - Enable or disable the filter',
        ],
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
            name: 'list',
            type: 'SUB_COMMAND',
            description: 'View the filtered words/phrases.',
            options: [{
                name: 'page',
                type: 'INTEGER',
                description: 'The page you want to view',
                required: false,
            }],
        }, {
            name: 'add',
            type: 'SUB_COMMAND',
            description: 'Add a word/phrase to the filter.',
            options: [{
                name: 'value',
                type: 'STRING',
                description: 'The word/phrase you want to add.',
                required: true,
            }],
        }, {
            name: 'remove',
            type: 'SUB_COMMAND',
            description: 'Remove a word/phrase from the filter.',
            options: [{
                name: 'value',
                type: 'STRING',
                description: 'The word/phrase you want to remove.',
                required: true,
            }],
        }, {
            name: 'toggle',
            type: 'SUB_COMMAND',
            description: 'Enable or disable the filter.',
            options: [{
                name: 'toggle',
                type: 'BOOLEAN',
                description: 'Set to true to enable the filter, set to false to disable the filter.',
                required: true,
            }],
        }],
    },

    run: async (bot, message, args) => {
        if (!args[0] || !isNaN(args[0])) {
            // Fetch the filter data
            const { filter } = message.settings.moderation;

            // If there are no filter entries, return an error
            if (filter.entries.length === 0) return message.errorReply('There are no entries in the automod filter!');

            // Page variables
            const pages = [];
            let page = 0;

            // Set filter entries in page array
            for (let i = 0; i < filter.entries.length; i += 20) {
                pages.push(filter.entries.slice(i, i + 20));
            }

            // Get the correct page, if the user provides a page number
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (!isNaN(args[1])) page = args[1] -= 1;

            // Check if the user specified a valid page
            if (!pages[page]) return message.errorReply("You didn't specify a valid page!");

            // Format the entries
            const formatted = pages[page].map((p) => `\`${p}\``);

            // Build the filter embed
            const embed = new MessageEmbed()
                .setAuthor(`Filtered words for ${message.guild.name}`, message.guild.iconURL({ format: 'png', dynamic: true }))
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setDescription(formatted.join(', '))
                .setFooter(`The filter is currently ${filter.state ? 'enabled' : 'disabled'} | Page ${page + 1} of ${pages.length}`);

            message.reply({ embeds: [embed] });
        } else if (args[0].toLowerCase() === 'add') {
            // If nothing was specified to be added, then return an error
            if (!args[1]) return message.errorReply('You did not specify a word to add to the filter!');

            // 1. Transform word to lowercase
            // 2. Fetch the current filter
            const toAdd = args[1].toLowerCase();
            const filter = message.settings.moderation.filter.entries;

            // If the word already exists in the filter, then return an error
            if (filter.includes(toAdd)) return message.errorReply('That word already exists in the filter!');

            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $push: {
                    'moderation.filter.entries': toAdd,
                },
            }).then(() => {
                message.confirmationReply(`\`${toAdd}\` was successfully added to the filter!`);
            }).catch((err) => {
                message.errorReply(`There was an error adding \`${toAdd}\` to the filter: \`${err.message}\``);
            });
        } else if (args[0].toLowerCase() === 'remove') {
            // If nothing was specified to be added, then return an error
            if (!args[1]) return message.errorReply('You did not specify a word to remove from the filter!');

            // 1. Transform word to lowercase
            // 2. Fetch the current filter
            const toRem = args[1].toLowerCase();
            const filter = message.settings.moderation.filter.entries;

            // If the word already exists in the filter, then return an error
            if (!filter.includes(toRem)) return message.errorReply("That word doesn't exist in the filter!");

            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $pull: {
                    'moderation.filter.entries': toRem,
                },
            }).then(() => {
                message.confirmationReply(`\`${toRem}\` was successfully removed from the filter!`);
            }).catch((err) => {
                message.errorReply(`There was an error removing \`${toRem}\` from the filter: \`${err.message}\``);
            });
        } else if (args[0].toLowerCase() === 'toggle') {
            // Get the DB query
            const toUpdate = message.settings.moderation.filter.state
                ? { 'moderation.filter.state': false }
                : { 'moderation.filter.state': true };

            // Update the setting
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(`Message filtering has been **${message.settings.moderation.filter.state ? 'disabled' : 'enabled'}**!`);
        } else {
            // If there was no page specifed, or the option was invalid, return an error
            message.errorReply('You did not specify a valid option!');
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'list') {
            // Fetch the filter data
            const { filter } = interaction.settings.moderation;

            // If there are no filter entries, return an error
            if (filter.entries.length === 0) return interaction.error('There are no entries in the automod filter!');

            // Page variables
            const pages = [];
            let page = 0;

            // Set filter entries in page array
            for (let i = 0; i < filter.entries.length; i += 20) {
                pages.push(filter.entries.slice(i, i + 20));
            }

            // Get the correct page, if the user provides a page number
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (interaction.options?.get('page')?.value) page = interaction.options.get('page').value -= 1;
            // Check if the user specified a valid page
            if (!pages[page]) return interaction.error("You didn't specify a valid page!");

            // Format the entries
            const formatted = pages[page].map((p) => `\`${p}\``);

            // Build the filter embed
            const embed = new MessageEmbed()
                .setAuthor(`Filtered words for ${interaction.guild.name}`, interaction.guild.iconURL({ format: 'png', dynamic: true }))
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(formatted.join(', '))
                .setFooter(`The filter is currently ${filter.state ? 'enabled' : 'disabled'} | Page ${page + 1} of ${pages.length}`);

            interaction.reply({ embeds: [embed] });
        } else if (sub === 'add') {
            // 1. Transform word to lowercase
            // 2. Fetch the current filter
            const toAdd = interaction.options.get('value').value.toLowerCase();
            const filter = interaction.settings.moderation.filter.entries;

            // If the word already exists in the filter, then return an error
            if (filter.includes(toAdd)) return interaction.error('That word already exists in the filter!');

            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                $push: {
                    'moderation.filter.entries': toAdd,
                },
            }).then(() => {
                interaction.confirmation(`\`${toAdd}\` was successfully added to the filter!`);
            }).catch((err) => {
                interaction.error(`There was an error adding \`${toAdd}\` to the filter: \`${err.message}\``);
            });
        } else if (sub === 'remove') {
            // 1. Transform word to lowercase
            // 2. Fetch the current filter
            const toRem = interaction.options.get('value').value.toLowerCase();
            const filter = interaction.settings.moderation.filter.entries;

            // If the word already exists in the filter, then return an error
            if (!filter.includes(toRem)) return interaction.error("That word doesn't exist in the filter!");

            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                $pull: {
                    'moderation.filter.entries': toRem,
                },
            }).then(() => {
                interaction.confirmation(`\`${toRem}\` was successfully removed from the filter!`);
            }).catch((err) => {
                interaction.error(`There was an error removing \`${toRem}\` from the filter: \`${err.message}\``);
            });
        } else if (sub === 'toggle') {
            // Get the DB query
            const toUpdate = interaction.options.get('toggle').value
                ? { 'moderation.filter.state': true }
                : { 'moderation.filter.state': false };

            // Update the setting
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

            // Send a confirmation message
            interaction.confirmation(`Message filtering has been **${interaction.options.get('toggle').value ? 'enabled' : 'disabled'}**!`);
        }
    },
};
