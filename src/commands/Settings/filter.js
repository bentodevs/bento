const { MessageEmbed } = require("discord.js");
const settings = require("../../database/models/settings");

module.exports = {
    info: {
        name: "filter",
        aliases: [],
        usage: "filter [setting/page] [value]",
        examples: ["filter add badword", "filter remove badword", "filter list", "filter list 2"],
        description: "Manage the chat filter",
        category: "Settings",
        info: null,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {
        if (!args[0] || !isNaN(args[0])) {
            // Fetch the filter data
            const filter = message.settings.moderation.filter;

            // If there are no filter entries, return an error
            if (filter.entries.length === 0)
                return message.error("There are no entries in the automod filter!");
            
            // Page variables
            const pages = [];
            let page = 0;

            // Set filter entries in page array
            for (let i = 0; i < filter.entries.length; i += 20) {
                pages.push(filter.entries.slice(i, i + 20));
            }

            // Get the correct page, if the user provides a page number
            if (!isNaN(args[1])) page = args[1] -= 1;

            // Check if the user specified a valid page
            if (!pages[page])
                return message.error("You didn't specify a valid page!");

            // Format the entries
            const formatted = pages[page].map(p => `\`${p}\``);

            // Build the filter embed
            const embed = new MessageEmbed()
                .setAuthor(`Filtered words for ${message.guild.name}`, message.guild.iconURL({ format: 'png', dynamic: true }))
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(formatted.join(', '))
                .setFooter(`The filter is currently ${filter.state ? "enabled" : "disabled"} | Page ${page + 1} of ${pages.length}`);
            
            message.channel.send(embed);
        } else if (args[0].toLowerCase() === "add") {
            // If nothing was specified to be added, then return an error
            if (!args[1])
                return message.error("You did not specify a word to add to the filter!");
            
            // 1. Transform word to lowercase
            // 2. Fetch the current filter
            const toAdd = args[1].toLowerCase(),
                filter = message.settings.moderation.filter.entries;
            
            // If the word already exists in the filter, then return an error
            if (filter.includes(toAdd))
                return message.error("That word already exists in the filter!");
            
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $push: {
                    "moderation.filter.entries": toAdd
                }
            })
                .then(() => message.confirmation(`\`${toAdd}\` was successfully added to the filter!`))
                .catch((err) => message.error(`There was an error adding \`${toAdd}\` to the filter: \`${err.message}\``));
        } else if (args[0].toLowerCase() === "remove") {
            // If nothing was specified to be added, then return an error
            if (!args[1])
                return message.error("You did not specify a word to remove from the filter!");
            
            // 1. Transform word to lowercase
            // 2. Fetch the current filter
            const toRem = args[1].toLowerCase(),
                filter = message.settings.moderation.filter.entries;
            
            // If the word already exists in the filter, then return an error
            if (!filter.includes(toRem))
                return message.error("That word doesn't exist in the filter!");
            
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                $pull: {
                    "moderation.filter.entries": toRem
                }
            })
                .then(() => message.confirmation(`\`${toRem}\` was successfully added to the filter!`))
                .catch((err) => message.error(`There was an error adding \`${toRem}\` to the filter: \`${err.message}\``));
        } else {
            // If there was no page specifed, or the option was invalid, return an error
            message.error("You did not specify a valid option!");
        }
    }
};