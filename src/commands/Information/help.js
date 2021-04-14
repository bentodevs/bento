const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "help",
        aliases: ["?", "commands"],
        usage: "help [command]",
        examples: ["help ping"],
        description: "Shows a list of commands or information about a specific command.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        const prefix = message.settings.general.prefix;

        if (!args[0] || args[0]?.toLowerCase() == "all") {
            // Grab all the commands
            let commands = bot.commands.array();
            // Define the catery object
            const categories = {};

            // If the user isn't a dev remove all the dev only commands
            if (!bot.config.general.devs.includes(message.author.id))
                commands = commands.filter(c => !c.opts.devOnly || !c.opts.disabled);
            // If the command was run in dms remove all the guild only commands
            if (!message.guild && !args[0]?.toLowerCase() == "all")
                commands = commands.filter(c => !c.opts.guildOnly);

            // Sort the commands
            const sorted = commands.sort((a, b) => a.info.category > b.info.category ? 1 : a.info.name > b.info.name && a.info.category === b.info.category ? 1 : -1);

            // Loop through the commands
            for (const x of sorted) {
                // Get the category name
                const category = x.info.category.toLowerCase();

                // Check if the array is already in the categories object
                if (!categories[category])
                    categories[category] = [];

                // Push the command to the category array
                categories[category].push(x);
            }

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`R2-D2 Commands`, bot.user.displayAvatarURL({ format: "png", dynamic: true }))
                .setThumbnail(bot.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
                .setDescription(`${!message.guild && args[0]?.toLowerCase() !== "all" ? `**-** Showing commands usable in DMs. To show all commands use \`${prefix}help all\`\n` : ""}**-** To use a command do \`${prefix}command\`.\n**-** Use \`${prefix}help <commandname>\` for additional details.`)
                .setColor("#ABCDEF");

            // Loop through the categories and add them as fields to the embed
            for (const [key, value] of Object.entries(categories)) {
                embed.addField(key.toTitleCase(), `\`${prefix}${value.map(a => a.info.name).join(`\`, \`${prefix}`)}\``);
            }

            // Send the embed to the user
            message.author.send(embed)
                .then(() => {
                    // If the command was ran in a guild send a confirmation message
                    if (message.guild)
                        message.confirmation("Sent you a DM with a list of my commands!");
                })
                .catch(() => {
                    // If something went wrong return an error specifying the user most likely has their DM's disabled
                    message.error("Something went wrong, you most likely have your DM's disabled!");
                });
        } else {
            // Get the command
            const command = bot.commands.get(args[0].toLowerCase()) || bot.commands.get(bot.aliases.get(args[0].toLowerCase()));

            // If the command wasn't found return an error
            if (!command)
                return message.error("I couldn't find the command you specified!");

            // Define the description var
            let desc = "";

            // Build the embed description
            if (command.info.description) desc += `${command.info.description}\n`;
            if (command.info.usage) desc += `\n**Usage:** \`${prefix}${command.info.usage}\``;
            if (command.info.examples.length >= 1) desc += `\n**${command.info.examples.length > 1 ? "Examples" : "Example"}:** \`${prefix}${command.info.examples.join(`\`, \`${prefix}`)}\``;
            if (command.info.aliases.length >= 1) desc += `\n**${command.info.aliases.length > 1 ? "Aliases" : "Alias"}:** \`${prefix}${command.info.aliases.join(`\`, \`${prefix}`)}\``;
            if (command.info.category) desc += `\n**Category:** ${command.info.category}`;
            if (command.info.info) desc += `\n\n**Info:**\n${stripIndents(command.info.info)}`;
            if (command.info.options.length) desc += `\n\n**Options:**\n● ${command.info.options.join("\n ● ")}`;

            // Build the embed
            const embed = new MessageEmbed()
                .setColor(bot.config.general.embedColor)
                .setTitle(`Command: ${prefix}${command.info.name}${command.opts.guildOnly ? " [Guild-only command]" : ""}`)
                .setThumbnail(bot.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
                .setDescription(desc)
                .setFooter("Do not include <> or [] — They indicate <required> and [optional] arguments.");

            // Send the embed
            message.channel.send(embed);
        }

    }
};