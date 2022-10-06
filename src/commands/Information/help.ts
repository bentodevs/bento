import { stripIndents } from 'common-tags';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, EmbedBuilder, EmbedField, PermissionFlagsBits,
} from 'discord.js';
import { commands } from '../../bot';
import logger from '../../logger';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR, OWNERS, WEBSITE } from '../../data/constants';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';
import { StringUtils } from '../../utils/StringUtils';

const command: Command = {
    info: {
        name: 'help',
        usage: 'help [command | category | "all"]',
        examples: [
            'help ping',
            'help moderation',
            'help all',
        ],
        description: 'Shows a list of commands or information about a specific command or category.',
        category: 'Information',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
        ],
    },
    opts: {
        guildOnly: false,
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
        opts: [{
            name: 'all',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View help information for all commands and categories.',
            options: []
        }, {
            name: 'category',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View information about a category.',
            options: [{
                name: 'category',
                type: ApplicationCommandOptionType.String,
                description: 'The category you wish to view commands and information for.',
                required: true,
                choices: [
                    { name: 'Developer', value: 'developer' },
                    { name: 'Fun', value: 'fun' },
                    { name: 'Information', value: 'information' },
                    { name: 'Miscellaneous', value: 'miscellaneous' },
                    { name: 'Moderation', value: 'moderation' },
                    { name: 'Utility', value: 'utility' }
                ]
            }]
        }, {
            name: 'command',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View information about a command.',
            options: [{
                name: 'command',
                type: ApplicationCommandOptionType.String,
                description: 'The command you wish to view information for.',
                autocomplete: true,
                required: true
            }]
        }],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'all') {
            // Grab all the commands
            let commandsArray: Array<Command> = Array.from(commands.values());

            interface CategoryCommands {
                [key: string]: Array<Command>
            }
            // Define the catery object
            const categoryCommands: CategoryCommands = {};

            // If the user isn't a dev remove all the dev only commands
            if (!OWNERS.includes(interaction.user.id ?? interaction.user.id)) commandsArray = commandsArray.filter((c) => !c.opts.devOnly || !c.opts.disabled);

            // Sort the commands
            const sorted = commandsArray.sort((a, b) => (a.info.category > b.info.category ? 1 : a.info.name > b.info.name && a.info.category === b.info.category ? 1 : 0));

            // Loop through the commands
            for (const x of sorted) {
                // Get the category name
                const commandCategory = x.info.category.toLowerCase();

                // Check if the array is already in the categories object
                if (!categoryCommands[commandCategory]) categoryCommands[commandCategory] = [];

                // Push the command to the category array
                categoryCommands[commandCategory].push(x);
            }

            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${bot.user?.username} Commands`, iconURL: bot.user?.displayAvatarURL() ?? '' })
                .setThumbnail(bot.user?.displayAvatarURL() ?? '')
                .setDescription(`${!interaction.inGuild() ? '**-** Showing commands usable in DMs. To show all commands use `/help all`\n' : ''}**-** To use a command do \`/command\`.\n**-** Use \`/help <commandname>\` for additional details.\n**-** Commands labeled with a 🏆 are premium commands.`)
                .setColor(DEFAULT_COLOR);

            const fields: Array<EmbedField> = [];

            // Loop through the categories and add them as fields to the embed
            for (const [key, value] of Object.entries(categoryCommands)) {
                fields.push({
                    name: StringUtils.toTitleCase(key),
                    value: `\`/${value.map((a: Command) => `${a.info.name}${a.opts.premium ? ' 🏆' : ''}`).join('`, `/')}\``,
                    inline: false,
                });
            }

            embed.addFields(fields);

            // Send the embed to the user
            if (!interaction.inGuild()) {
                interaction.user?.send({ embeds: [embed] })
                    .then(() => InteractionResponseUtils.confirmation(interaction, "I've sent you a DM with a list of my commands!", true))
                    .catch(() => InteractionResponseUtils.error(interaction, "Something went wrong, you most likely have your DM's disabled!", true));
            } else {
                await interaction.reply({ embeds: [embed] }).catch((err) => logger.error(err));
            }
        } else if (subCommand === 'category') {
            const category = interaction.options.getString('category', true);
            // Get all the commands for the specified category
            const commandsList = commands.filter((c: Command) => c.info.category.toLowerCase() === category).map((c: Command) => `\`/${c.info.name}\``);

            // Build the Embed
            const embed = new EmbedBuilder()
                .setColor(DEFAULT_COLOR)
                .setTitle(`Category: ${StringUtils.toTitleCase(category)}`)
                .addFields([{ name: '**Commands**', value: commandsList.join(', ') }])
                .setFooter({ text: 'For more detailed information about a command use /help <command>' });

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (subCommand === 'command') {
            const command = commands.get(interaction.options.getString('command', true)) as Command;

            // Define the description var
            let desc = '';

            // Build the embed description
            if (command.info.description) desc += `${command.info.description}\n`;
            if (command.info.usage) desc += `\n**Usage:** \`/${command.info.usage}\``;
            if (command.info.examples.length >= 1) desc += `\n**${command.info.examples.length > 1 ? 'Examples' : 'Example'}:** \`/${command.info.examples.join('`, `/')}\``;
            if (command.info.category) desc += `\n**Category:** ${command.info.category}`;

            if (command.opts.premium) desc += `\n**Premium:** This command requires you to have [premium](${WEBSITE}).`;

            // Add additional info and options to the description
            if (command.info.information) desc += `\n\n**Info:**\n${stripIndents(command.info.information)}`;

            // Build the embed
            const embed = new EmbedBuilder()
                .setColor(DEFAULT_COLOR)
                .setTitle(`Command: /${command.info.name}${command.opts.guildOnly ? ' [Guild-only command]' : ''}`)
                .setDescription(desc)
                .setFooter({ text: 'Do not include <> or [] — They indicate <required> and [optional] arguments.' });

            // Send the embed
            interaction.reply({ embeds: [embed] });
        }
    },
};

export default command;
