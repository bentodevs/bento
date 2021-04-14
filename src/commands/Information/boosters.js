const { format, formatDistance } = require("date-fns");
const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "boosters",
        aliases: [],
        usage: "boosters [page]",
        examples: ["boosters 2"],
        description: "List the users that are boosting the guild.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_GUILD",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Page vars
        const pages = [];
        let page = 0;

        // Get the boosters
        const boosters = message.guild.members.cache.filter(a => a.premiumSinceTimestamp);

        // If the guild has no boosters return an error
        if (!boosters.size)
            return message.error("This guild doesn't have any boosters!");

        // Sort the boosters
        const sorted = boosters.sort((a, b) => a.premiumSinceTimestamp - b.premiumSinceTimestamp);

        // Loop through the boosters and seperate them into pages of 10
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // If args[0] is a number set it as the page
        if (!isNaN(args[0])) 
            page = args[0] - 1;
        // If the page doesn't exist retrun an error
        if (!pages[page])
            return message.error("You didn't specify a valid page!");

        // Format the boosters
        const formatted = pages[page].map(a => `\`${a.user.tag}\` | **Boosting Since:** ${format(a.premiumSinceTimestamp, "PPp")} (${formatDistance(a.premiumSinceTimestamp, Date.now())} ago)`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Nitro Boosters of ${message.guild.name}`, message.guild.iconURL({ format: "png", dynamic: true }))
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(formatted.join("\n"))
            .setFooter(`${sorted.size} total boosters | Page ${page + 1} of ${pages.length}`);

        // Send the embed
        message.channel.send(embed);

    }
};