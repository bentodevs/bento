const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const { getRole } = require('../../modules/functions/getters');
const { filterSelfPerms } = require('../../modules/functions/permissions');

module.exports = {
    info: {
        name: 'help',
        aliases: ['?', 'commands'],
        usage: 'help [command | category | "all"]',
        examples: [
            'help ping',
            'help moderation',
            'help all',
        ],
        description: 'Shows a list of commands or information about a specific command or category.',
        category: 'Information',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'command_category',
            type: 'STRING',
            description: 'The command or category you want to view the information of.',
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        // Get the bot prefix
        const { prefix } = message.settings.general;

        // Get all the command categories
        const getCategories = bot.commands.map((c) => c.info.category.toLowerCase());
        const categories = getCategories.filter((item, index) => getCategories.indexOf(item) >= index);

        const find = message.options?.get('command_category')?.value || args?.[0]?.toLowerCase();

        // Get the command or category
        const command = bot.commands.get(find) || bot.commands.get(bot.aliases.get(find));
        const category = categories[categories.indexOf(find)];

        // If the command or category is dev only return an error
        if ((command?.info.category.toLowerCase() === 'dev' || category === 'dev') && !bot.config.general.devs.includes(message.author.id)) return message.errorReply("You didn't specify a valid command or category!");

        if ((!args?.[0] && !message.options?.get('command_category')?.value) || (args?.[0]?.toLowerCase() === 'all' || message.options?.get('command_category')?.value === 'all')) {
            // Grab all the commands
            let commands = Array.from(bot.commands.values());
            // Define the catery object
            // eslint-disable-next-line no-shadow
            const categories = {};

            // If the user isn't a dev remove all the dev only commands
            if (!bot.config.general.devs.includes(message.author?.id ?? message.user.id)) commands = commands.filter((c) => !c.opts.devOnly || !c.opts.disabled);
            // If the command was run in dms remove all the guild only commands
            if (!message.guild && !(args?.[0]?.toLowerCase() === 'all' || message.options?.get('command')?.value === 'all')) commands = commands.filter((c) => !c.opts.guildOnly);

            // Sort the commands
            // eslint-disable-next-line no-nested-ternary
            const sorted = commands.sort((a, b) => (a.info.category > b.info.category ? 1 : a.info.name > b.info.name && a.info.category === b.info.category ? 1 : 0));

            // Loop through the commands
            for (const x of sorted) {
                // Get the category name
                // eslint-disable-next-line no-shadow
                const category = x.info.category.toLowerCase();

                // Check if the array is already in the categories object
                if (!categories[category]) categories[category] = [];

                // Push the command to the category array
                categories[category].push(x);
            }

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor('R2-D2 Commands', bot.user.displayAvatarURL({ format: 'png', dynamic: true }))
                .setThumbnail(bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 }))
                .setDescription(`${!message.guild && args[0]?.toLowerCase() !== 'all' ? `**-** Showing commands usable in DMs. To show all commands use \`${prefix}help all\`\n` : ''}**-** To use a command do \`${prefix}command\`.\n**-** Use \`${prefix}help <commandname>\` for additional details.\n**-** Commands labeled with a 🏆 are premium commands.`)
                .setColor('#ABCDEF');

            // Loop through the categories and add them as fields to the embed
            for (const [key, value] of Object.entries(categories)) {
                embed.addField(key.toTitleCase(), `\`${prefix}${value.map((a) => `${a.info.name}${a.opts.premium ? ' 🏆' : ''}`).join(`\`, \`${prefix}`)}\``);
            }

            // Send the embed to the user
            (message.author?.send({ embeds: [embed] }) ?? message.user.send({ embeds: [embed] }))
                .then(() => {
                    // If the "message" is actually an interaction, the use interaction methods
                    if (message?.commandId) return message.confirmation({ content: "I've sent you a DM with a list of my commands!", ephemeral: true });
                    // If the command was ran in a guild send a confirmation message
                    if (message.guild) message.confirmationReply("I've sent you a DM with a list of my commands!");
                })
                .catch(() => {
                    // If the "message" is actually an interaction, the use interaction methods
                    if (message?.commandId) return message.error({ content: "Something went wrong, you most likely have your DM's disabled!", ephemeral: true });
                    // If something went wrong return an error specifying the user most likely has their DM's disabled
                    message.errorReply("Something went wrong, you most likely have your DM's disabled!");
                });
        } else if (command) {
            // Define the description var
            let desc = '';

            // Delete the self perm so the similarity check won't fail
            const perms = filterSelfPerms(command.perms);

            // Build the embed description
            if (command.info.description) desc += `${command.info.description}\n`;
            if (command.info.usage) desc += `\n**Usage:** \`${prefix}${command.info.usage}\``;
            if (command.info.examples.length >= 1) desc += `\n**${command.info.examples.length > 1 ? 'Examples' : 'Example'}:** \`${prefix}${command.info.examples.join(`\`, \`${prefix}`)}\``;
            if (command.info.aliases.length >= 1) desc += `\n**${command.info.aliases.length > 1 ? 'Aliases' : 'Alias'}:** \`${prefix}${command.info.aliases.join(`\`, \`${prefix}`)}\``;
            if (command.info.category) desc += `\n**Category:** ${command.info.category}`;

            if (message.guild) {
                // Get the category or command permission
                const checkCat = message.permissions.categories[command.info.category.toLowerCase()]?.permission && JSON.stringify(message.permissions.commands[command.info.name]) === JSON.stringify(perms);
                const permission = checkCat ? message.permissions.categories[command.info.category.toLowerCase()] : message.permissions.commands[command.info.name];

                // Define the perm var
                let perm = '';

                if (permission.type === 'role' && permission.hierarchic) {
                    // Try to get the role
                    const role = await getRole(message, permission.permission);

                    // Add the data to the perm message
                    perm = role?.id === message.guild.id ? 'open to everyone' : `the ${role ?? '<deleted role>'} role and up`;
                } else if (permission.type === 'role' && !permission.hierarchic) {
                    // Define the roles array
                    const roles = [];

                    if (permission.permission.length === 1 && (permission.permission.includes('@everyone') || permission.permission.includes(message.guild.id))) {
                        // If the only permission in the array is the everyone role set the perm message to "open to everyone"
                        perm = 'open to everyone';
                    } else {
                        // Loop through the permissions and add them to the roles array
                        for (const i of permission.permission) {
                            if (i === '@everyone' || i === message.guild.id) {
                                roles.push('@everyone');
                            } else {
                                const role = await getRole(message, i);
                                roles.push(role?.toString() ?? '<deleted role>');
                            }
                        }

                        // Add the data to the perm message
                        perm = `the ${roles.join(', ')} role${roles.length > 1 ? 's' : ''}`;
                    }
                } else if (permission.type === 'discord') {
                    // Add the data to the perm message
                    perm = `the Discord permission \`${permission.permission}\``;
                } else if (command.info.category.toLowerCase() === 'dev') {
                    // Add the data to the perm message
                    perm = 'Only available to bot devs';
                }

                if (checkCat) {
                    // If the perm is set for a category add it to the perm message
                    perm += ` (set for the \`${command.info.category}\` category)`;
                } else if (JSON.stringify(permission) === JSON.stringify(perms)) {
                    // If the perm is the default perm add it to the perm message
                    perm += ' (default)';
                } else {
                    // Add a dot
                    perm += '.';
                }

                // Add the permissions to the description
                desc += `\n**Permissions:** ${perm}`;
            }

            if (command.opts.premium) desc += '\n**Premium:** This command requires you to have [premium](https://r2-d2.dev/).';

            // Add additional info and options to the description
            if (command.info.info) desc += `\n\n**Info:**\n${stripIndents(command.info.info)}`;
            if (command.info.options.length) desc += `\n\n**Options:**\n● ${command.info.options.join('\n ● ')}`;

            // Build the embed
            const embed = new MessageEmbed()
                .setColor(bot.config.general.embedColor)
                .setTitle(`Command: ${prefix}${command.info.name}${command.opts.guildOnly ? ' [Guild-only command]' : ''}`)
                .setDescription(desc)
                .setFooter('Do not include <> or [] — They indicate <required> and [optional] arguments.');

            // Send the embed
            message.reply({ embeds: [embed] });
        } else if (category) {
            // Get all the commands for the specified category
            const commands = bot.commands.filter((c) => c.info.category.toLowerCase() === category).map((c) => `\`${prefix}${c.info.name}\``);

            // Get the category or command permission
            const permission = message?.guild ? message.permissions?.categories[category] : null;

            // Define the perm var
            let perm = '';

            if (!permission?.type) {
                // If no permission is set set the perm to "No permission set."
                perm = 'No permission set.';
            } else if (permission.type === 'role' && permission.hierarchic) {
                // Try to get the role
                const role = await getRole(message, permission.permission);

                // Add the data to the perm message
                perm = role?.id === message.guild.id ? 'open to everyone' : `the ${role ?? '<deleted role>'} role and up`;
            } else if (permission.type === 'role' && !permission.hierarchic) {
                // Define the roles array
                const roles = [];

                if (permission.permission.length === 1 && (permission.permission.includes('@everyone') || permission.permission.includes(message.guild.id))) {
                    // If the only permission in the array is the everyone role set the perm message to "open to everyone"
                    perm = 'open to everyone';
                } else {
                    // Loop through the permissions and add them to the roles array
                    for (const i of permission.permission) {
                        if (i === '@everyone' || i === message.guild.id) {
                            roles.push('@everyone');
                        } else {
                            const role = await getRole(message, i);
                            roles.push(role?.toString() ?? '<deleted role>');
                        }
                    }

                    // Add the data to the perm message
                    perm = `the ${roles.join(', ')} role${roles.length > 1 ? 's' : ''}`;
                }
            } else if (permission.type === 'discord') {
                // Add the data to the perm message
                perm = `the Discord permission \`${permission.permission}\``;
            }

            // Build the Embed
            const embed = new MessageEmbed()
                .setColor(bot.config.general.embedColor)
                .setTitle(`Category: ${category}`)
                .setDescription(stripIndents`**Name:** \`${category.toTitleCase()}\`
                **Permissions:** ${perm}`)
                .addField('**Commands**', commands.join(', '))
                .setFooter(`For more detailed information about a command use ${prefix}help <command>`);

            // Send the embed
            message.reply({ embeds: [embed] });
        } else {
            // Send an error
            message.errorReply("You didn't specify a valid command or category!");
        }
    },
};
