
import settings from '../../database/models/settings';
import { Command } from '../../modules/interfaces/cmd';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { DEFAULT_COLOR } from '../../data/constants';
import { getSettings } from '../../database/mongo';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';
import { commands } from '../../bot';

const command: Command = {
    info: {
        name: 'toggle',
        usage: 'toggle <"command"/"category"> <command/category>',
        examples: [
            'toggle command boosters',
            'toggle category Fun',
        ],
        description: 'Toggle the ability to use Commands or Categories.',
        category: 'Settings',
        information: '[Click here for a list of Commands & Categories](https://docs.bento-bot.com/).',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks
        ],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        dmPermission: false,
        defaultPermission: false,
        opts: [{
            name: 'list',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View the current server settings.',
            options: [],
        }, {
            name: 'command',
            type: ApplicationCommandOptionType.Subcommand,
            description: "Toggle the ability for Users to use a Command.",
            options: [{
                name: 'command',
                type: ApplicationCommandOptionType.String,
                description: 'The Command to toggle.',
                required: true,
                autocomplete: true
            }]
        }, {
            name: 'category',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Toggle the ability for Users to use Commands in a Category.',
            options: [{
                name: 'category',
                type: ApplicationCommandOptionType.String,
                description: 'The Category to toggle.',
                required: true,
                autocomplete: true,
            }]
        }],
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        // Get the guild settings
        const guildSettings = await getSettings(interaction.guild?.id ?? '');

        if (sub === 'list') {
            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Toggled Commands & Categories in ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
                .setColor(DEFAULT_COLOR)
                .setFields([{
                    name: 'Disabled Commands',
                    value: guildSettings.general.disabledCommands.length > 0 ? guildSettings.general.disabledCommands.map(c => `\`${c}\``).join(', ') : 'None',
                    inline: true
                }, {
                    name: 'Disabled Categories',
                    value: guildSettings.general.disabledCategories.length > 0 ? guildSettings.general.disabledCategories.map(c => `\`${c}\``).join(', ') : 'None',
                    inline: true
                }]);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (sub === 'command') {
            // Get the command name
            const cmd = interaction.options.getString('command', true);

            // Check if the command exists
            if (!commands.get(cmd)) return InteractionResponseUtils.error(interaction, `The command \`${cmd}\` does not exist.`, true);

            // Check if the command is already disabled
            if (guildSettings.general.disabledCommands.includes(cmd)) {
                // Remove the command from the array
                await settings.findOneAndUpdate({ _id: interaction.guildId }, { $pull: { "general.disabledCommands": cmd } });

                // Send the response
                interaction.reply({ content: `The command \`${cmd}\` has been enabled.`, ephemeral: true });
            } else {
                // Add the command to the array
                await settings.findOneAndUpdate({ _id: interaction.guildId }, { $push: { "general.disabledCommands": cmd } });

                // Send the response
                interaction.reply({ content: `The command \`${cmd}\` has been disabled.`, ephemeral: true });
            }

            // Save the settings
            await settings.updateOne({ guildID: interaction.guild?.id }, { $set: { disabledCommands: guildSettings.general.disabledCommands } });
        } else if (sub === 'category') {
            // Get the category name
            const category = interaction.options.getString('category', true);

            // Check if the category is already disabled
            if (guildSettings.general.disabledCategories.includes(category)) {
                // Remove the category from the array
                await settings.findOneAndUpdate({ _id: interaction.guildId }, { $pull: { "general.disabledCategories": category.toLowerCase() } });

                // Send the response
                interaction.reply({ content: `The category \`${category}\` has been enabled.`, ephemeral: true });
            } else {
                // Add the category to the array
                await settings.findOneAndUpdate({ _id: interaction.guildId }, { $push: { "general.disabledCategories": category.toLowerCase() } });

                // Send the response
                interaction.reply({ content: `The category \`${category}\` has been disabled.`, ephemeral: true });
            }

            // Save the settings
            await settings.updateOne({ guildID: interaction.guild?.id }, { $set: { disabledCategories: guildSettings.general.disabledCategories } });
        }
    },
};

export default command;
