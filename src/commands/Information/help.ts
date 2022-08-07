import { stripIndents } from 'common-tags';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, EmbedBuilder, EmbedField, PermissionFlagsBits,
} from 'discord.js';
import { commands } from '../../bot';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR, OWNERS, WEBSITE } from '../../modules/structures/constants';
import { InteractionResponseUtils, StringUtils } from '../../modules/utils/TextUtils';

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
            name: 'command_category',
            type: ApplicationCommandOptionType.String,
            description: 'The command or category you want to view the information of.',
            required: false,
        }],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get all the command categories
        const getCategories = commands.map((c) => c.info.category.toLowerCase());
        const categories = getCategories.filter((item, index) => getCategories.indexOf(item) >= index);

        const find = interaction.options.getString('command_category') ?? '';

        // Get the command or category
        const foundCommand = commands.get(find);
        const category = categories[categories.indexOf(find)];

        // If the command or category is dev only return an error
        if ((foundCommand?.info.category.toLowerCase() === 'dev' || category === 'dev') && !OWNERS.includes(interaction.user.id)) return InteractionResponseUtils.error(interaction, "You didn't specify a valid command or category!", true);

        if (!interaction.options?.get('command_category')?.value || interaction.options?.get('command_category')?.value === 'all') {
            // Grab all the commands
            let commandsArray: Array<Command> = Array.from(commands.values());

            interface CategoryCommands {
                [key: string]: Array<Command>
            }
            // Define the catery object
            const categoryCommands: CategoryCommands = {};

            // If the user isn't a dev remove all the dev only commands
            if (!OWNERS.includes(interaction.user.id ?? interaction.user.id)) commandsArray = commandsArray.filter((c) => !c.opts.devOnly || !c.opts.disabled);
            // If the command was run in dms remove all the guild only commands
            if (!interaction.guild && find !== 'all') commandsArray = commandsArray.filter((c) => !c.opts.guildOnly);

            // Sort the commands
            // eslint-disable-next-line no-nested-ternary
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
            (interaction.user?.send({ embeds: [embed] }) ?? interaction.user.send({ embeds: [embed] }))
                .then(() => InteractionResponseUtils.confirmation(interaction, "I've sent you a DM with a list of my commands!", true))
                .catch(() => InteractionResponseUtils.error(interaction, "Something went wrong, you most likely have your DM's disabled!", true));
        } else if (foundCommand) {
            // Define the description var
            let desc = '';

            // Build the embed description
            if (foundCommand.info.description) desc += `${foundCommand.info.description}\n`;
            if (foundCommand.info.usage) desc += `\n**Usage:** \`/${foundCommand.info.usage}\``;
            if (foundCommand.info.examples.length >= 1) desc += `\n**${foundCommand.info.examples.length > 1 ? 'Examples' : 'Example'}:** \`/${foundCommand.info.examples.join('`, `/')}\``;
            if (foundCommand.info.category) desc += `\n**Category:** ${foundCommand.info.category}`;

            if (foundCommand.opts.premium) desc += `\n**Premium:** This command requires you to have [premium](${WEBSITE}).`;

            // Add additional info and options to the description
            if (foundCommand.info.information) desc += `\n\n**Info:**\n${stripIndents(foundCommand.info.information)}`;

            // Build the embed
            const embed = new EmbedBuilder()
                .setColor(DEFAULT_COLOR)
                .setTitle(`Command: /${foundCommand.info.name}${foundCommand.opts.guildOnly ? ' [Guild-only command]' : ''}`)
                .setDescription(desc)
                .setFooter({ text: 'Do not include <> or [] — They indicate <required> and [optional] arguments.' });

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (category) {
            // Get all the commands for the specified category
            const commandsList = commands.filter((c: Command) => c.info.category.toLowerCase() === category).map((c: Command) => `\`/${c.info.name}\``);

            // Build the Embed
            const embed = new EmbedBuilder()
                .setColor(DEFAULT_COLOR)
                .setTitle(`Category: ${category}`)
                .addFields([{ name: '**Commands**', value: commandsList.join(', ') }])
                .setFooter({ text: 'For more detailed information about a command use /help <command>' });

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else {
            // Send an error
            InteractionResponseUtils.error(interaction, "You didn't specify a valid command or category!", true);
        }
    },
};

export default command;
