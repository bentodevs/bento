const { format, formatDistance } = require("date-fns");
const { MessageEmbed } = require("discord.js");
const tags = require("../../database/models/tags");

module.exports = {
    info: {
        name: "tags",
        aliases: [
            "tag"
        ],
        usage: "tags <name | \"list\"> [content | page | \"delete\"]",
        examples: [
            "tags pong **Ping!**",
            "tags pong delete",
            "tags list",
            "tags list 2"
        ],
        description: "Manage tags for this guild.",
        category: "Miscellaneous",
        info: null,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get all the tags for this guild
        const guildTags = await tags.find({ guild: message.guild.id });

        if (args[0].toLowerCase() == "list") {
            // If the guild doesn't have any tags return an error
            if (!guildTags.length)
                return message.error("This guild doesn't have any tags!");

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
            if (!Number.isNaN(args[1]))
                page = args[1] -= 1;
            // If the page doesn't exist return an error
            if (!pages[page])
                return message.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map(m => `**Name:** \`${m.name}\` | **Last Modified:** ${format(m.lastModified, "PPp")} (${formatDistance(m.lastModified, Date.now(), { addSuffix: true })})`);

            // Create the tags embed
            const embed = new MessageEmbed()
                .setAuthor(`Custom tags in ${message.guild.name}`, message.guild.iconURL({format: "png", dynamic: true}))
                .setFooter(`${guildTags.length} total tags | Page ${page + 1} of ${pages.length}`)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description);
            
            // Send the embed
            message.channel.send(embed);
        } else if (!args[1]) {
            // Get the tag name and try to find the tag in the database
            const name = args[0].toLowerCase(),
            tag = await tags.findOne({ guild: message.guild.id, name: name });

            // If the tag wasn't found return an error
            if (!tag)
                return message.error("You didn't specify a valid tag!");

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`Tag: ${tag.name}`)
                .setDescription(`**Tag Name:** \`${tag.name}\`
                **Last Modified:** ${format(tag.lastModified, "PPp")}
                
                Content: \`\`\`${tag.content}\`\`\``)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setThumbnail("https://i.imgur.com/LCbKsrE.png");

            // Send a message with the tag content
            message.channel.send(embed);
        } else if (args[1]?.toLowerCase() == "delete") {
            // Get the tag name and try to find the tag in the database
            const name = args[0].toLowerCase(),
            tag = await tags.findOne({ guild: message.guild.id, name: name });

            // If the tag wasn't found return an error
            if (!tag)
                return message.error("You didn't specify a valid tag!");

            // Delete the tag
            await tags.findOneAndDelete({ guild: message.guild.id, name: name });

            // Send a confirmation message
            message.confirmation(`The tag **${name}** was successfully deleted!`);
        } else if (args[1]?.toLowerCase() == "perms") {
            // TODO: [BOT-6] Tag Permissions
        } else {
            // If the guild is at the max of 50 tags return an error
            if (guildTags.size >= 50)
                return message.error("This guild has reached the limit of 50 tags!");

            // Grab the tag name, check if a tag with the name already exists and grab the tag content
            const name = args[0].toLowerCase(),
            tag = await tags.findOne({ guild: message.guild.id, name: name}),
            content = args.slice(1).join(" ");

            // If a command or alias already exists with the tag name return an error
            if (bot.commands.has(name) || bot.aliases.has(name))
                return message.error("The tag you specified is already being used as a command or alias! You cannot use it as a tag.");

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
                message.confirmation(`Successfully updated the tag **${name}** with the new content!`);
            } else {
                // If the tag doesn't exist create the db object
                tags.create(object);
                // Send a confirmation message
                message.confirmation(`Successfully created the tag **${name}**!`);
            }
        }

    }
};