const { formatDistance } = require("date-fns");
const { format, utcToZonedTime } = require("date-fns-tz");
const { MessageEmbed, Permissions } = require("discord.js");
const tags = require("../../database/models/tags");

module.exports = {
    info: {
        name: "tags",
        aliases: [
            "tag"
        ],
        usage: "tags <name | \"list\"> [option | page] <value>",
        examples: [
            "tags pong **Ping!**",
            "tags pong delete",
            "tags list",
            "tags list 2"
        ],
        description: "Manage tags for this guild.",
        category: "Miscellaneous",
        info: `Placeholders *(these get replaced with actual values by the bot)*
        
        \`{author}\` - Tags the person who sends the tag.
        \`{mention}\` - Tags the person mentioned.
        \`{prefix}\` - The bots prefix for this guild.
        \`{guild}\` - The name of this guild.
        
        Add \`-e\` to the message to make the output an embed.
        You can set up to 50 tags per guild.`,
        options: [
            "`tags <name>` - Display the tag content.",
            "`tags <name> delete` - Deletes the tag.",
            "`tags <name> perms [role | discord permission | \"default\"]` - Set tag perms.",
            "`tags <name> <content>` - Create or edit a tag.",
            "`tags list [page]` - View a list of tags.",
        ]
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "create",
            type: "SUB_COMMAND",
            description: "Create a new tag.",
            options: [{
                name: "name",
                type: "STRING",
                description: "The name of the tag (cannot include spaces, special characters, etc).",
                required: true
            }, {
                name: "content",
                type: "STRING",
                description: "The content of the tag.",
                required: true
            }]
        }, {
            name: "list",
            type: "SUB_COMMAND",
            description: "Sends a list of the tags in this guild.",
            options: [{
                name: "page",
                type: "INTEGER",
                description: "The page you want to view.",
                required: false
            }]
        }, {
            name: "delete",
            type: "SUB_COMMAND",
            description: "Delete a tag.",
            options: [{
                name: "name",
                type: "STRING",
                description: "The name of the tag you want to delete.",
                required: true
            }]
        }]
    },

    run: async (bot, message, args) => {

        // Get all the tags for this guild
        const guildTags = await tags.find({ guild: message.guild.id });

        if (args[0].toLowerCase() == "list") {
            // If the guild doesn't have any tags return an error
            if (!guildTags.length)
                return message.errorReply("This guild doesn't have any tags!");

            // Sort the tags
            const sorted = guildTags.sort((a, b) => b.lastModified - a.lastModified);
            
            // Page vars
            const pages = [];
            let page = 0;

            // Loop through the tags and devide them into pages of 10
            for (let i = 0; i < sorted.length; i += 10) {
                pages.push(sorted.slice(i, i + 10));
            }

            // If args[1] is a number set it as the page
            if (!isNaN(args[1]))
                page = args[1] -= 1;
            // If the page doesn't exist return an error
            if (!pages[page])
                return message.errorReply("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map(m => `**Name:** \`${m.name}\` | **Last Modified:** ${format(utcToZonedTime(m.lastModified, message.settings.general.timezone), "PPp (z)", { timeZone: message.settings.general.timezone })} (${formatDistance(m.lastModified, Date.now(), { addSuffix: true })})`);

            // Create the tags embed
            const embed = new MessageEmbed()
                .setAuthor(`Custom tags in ${message.guild.name}`, message.guild.iconURL({format: "png", dynamic: true}))
                .setFooter(`${guildTags.length} total tags | Page ${page + 1} of ${pages.length}`)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description.join("\n"));
            
            // Send the embed
            message.reply({ embeds: [embed] });
        } else if (!args[1]) {
            // Get the tag name and try to find the tag in the database
            const name = args[0].toLowerCase(),
            tag = await tags.findOne({ guild: message.guild.id, name: name });

            // If the tag wasn't found return an error
            if (!tag)
                return message.errorReply("You didn't specify a valid tag!");

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`Tag: ${tag.name}`)
                .setDescription(`**Tag Name:** \`${tag.name}\`
                **Last Modified:** ${format(tag.lastModified, "PPp")}
                
                Content: \`\`\`${tag.content}\`\`\``)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setThumbnail("https://i.imgur.com/LCbKsrE.png");

            // Send a message with the tag content
            message.reply({ embeds: [embed] });
        } else if (args[1]?.toLowerCase() == "delete") {
            // Get the tag name and try to find the tag in the database
            const name = args[0].toLowerCase(),
            tag = await tags.findOne({ guild: message.guild.id, name: name });

            // If the tag wasn't found return an error
            if (!tag)
                return message.errorReply("You didn't specify a valid tag!");

            // Delete the tag
            await tags.findOneAndDelete({ guild: message.guild.id, name: name });

            // Send a confirmation message
            message.confirmationReply(`The tag **${name}** was successfully deleted!`);
        } else if (args[1]?.toLowerCase() == "perms") {
            if (!args[2]) {
                // Code
            } else if (Permissions.FLAGS[args[2].toUpperCase()]) {
                // Code
            } else if (args[2].toLowerCase() == "default") {
                // Code
            } else {
                // Code
            }
        } else {
            // If the guild is at the max of 50 tags return an error
            if (guildTags.size >= 50)
                return message.errorReply("This guild has reached the limit of 50 tags!");

            // Grab the tag name, check if a tag with the name already exists and grab the tag content
            const name = args[0].toLowerCase(),
            tag = await tags.findOne({ guild: message.guild.id, name: name}),
            content = args.slice(1).join(" ");

            // If a command or alias already exists with the tag name return an error
            if (bot.commands.has(name) || bot.aliases.has(name))
                return message.errorReply("The tag you specified is already being used as a command or alias! You cannot use it as a tag.");

            // Prepare the tag data object
            const object = {
                guild: message.guild.id,
                name: name,
                content: content,
                lastModified: Date.now()
            };

            if (tag) {
                // If the tag already exists update the tag content
                await tags.findOneAndUpdate({ guild: message.guild.id, name: name }, object);
                // Send a confirmation message
                message.confirmationReply(`Successfully updated the tag **${name}** with the new content!`);
            } else {
                // If the tag doesn't exist create the db object
                tags.create(object);
                // Send a confirmation message
                message.confirmationReply(`Successfully created the tag **${name}**!`);
            }
        }

    },

    run_interaction: async (bot, interaction) => {

        // Get all the tags for this guild
        const guildTags = await tags.find({ guild: interaction.guild.id });

        if (interaction.options.get("list")) {
            // If the guild doesn't have any tags return an error
            if (!guildTags.length)
                return interaction.error("This guild doesn't have any tags!");

            // Sort the tags
            const sorted = guildTags.sort((a, b) => b.lastModified - a.lastModified);
            
            // Page vars
            const pages = [];
            let page = 0;

            // Loop through the tags and devide them into pages of 10
            for (let i = 0; i < sorted.length; i += 10) {
                pages.push(sorted.slice(i, i + 10));
            }

            // If the page option is there set it as the page
            if (interaction.options.get("list").options?.get("page")?.value)
                page = interaction.options.get("list").options.get("page").value -= 1;
            // If the page doesn't exist return an error
            if (!pages[page])
                return interaction.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map(m => `**Name:** \`${m.name}\` | **Last Modified:** ${format(m.lastModified, "PPp")} (${formatDistance(m.lastModified, Date.now(), { addSuffix: true })})`);

            // Create the tags embed
            const embed = new MessageEmbed()
                .setAuthor(`Custom tags in ${interaction.guild.name}`, interaction.guild.iconURL({format: "png", dynamic: true}))
                .setFooter(`${guildTags.length} total tags | Page ${page + 1} of ${pages.length}`)
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description.join("\n"));
            
            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (interaction.options.get("delete")) {
            // Get the tag name and try to find the tag in the database
            const name = interaction.options.get("delete").options.get("name").value,
            tag = await tags.findOne({ guild: interaction.guild.id, name: name });

            // If the tag wasn't found return an error
            if (!tag)
                return interaction.error("You didn't specify a valid tag!");

            // Delete the tag
            await tags.findOneAndDelete({ guild: interaction.guild.id, name: name });

            // Send a confirmation message
            interaction.confirmation(`The tag **${name}** was successfully deleted!`);
        } else if (interaction.options.get("create")) {
            // If the guild is at the max of 50 tags return an error
            if (guildTags.size >= 50)
                return interaction.error("This guild has reached the limit of 50 tags!");

            // Grab the tag name, check if a tag with the name already exists and grab the tag content
            const name = interaction.options.get("create").options.get("name").value,
            tag = await tags.findOne({ guild: interaction.guild.id, name: name}),
            content = interaction.options.get("create").options.get("content").value;

            // Check if the tag name has any spaces
            if (/ /g.test(name))
                return interaction.error("A tag name cannot contain any spaces!");

            // If a command or alias already exists with the tag name return an error
            if (bot.commands.has(name) || bot.aliases.has(name))
                return interaction.error("The tag you specified is already being used as a command or alias! You cannot use it as a tag.");

            // Prepare the tag data object
            const object = {
                guild: interaction.guild.id,
                name: name,
                content: content,
                lastModified: Date.now()
            };

            if (tag) {
                // If the tag already exists update the tag content
                await tags.findOneAndUpdate({ guild: interaction.guild.id, name: name }, object);
                // Send a confirmation message
                interaction.confirmation(`Successfully updated the tag **${name}** with the new content!`);
            } else {
                // If the tag doesn't exist create the db object
                tags.create(object);
                // Send a confirmation message
                interaction.confirmation(`Successfully created the tag **${name}**!`);
            }
        }

    }
};