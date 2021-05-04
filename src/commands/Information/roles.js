const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "roles",
        aliases: [],
        usage: "roles [page]",
        examples: [
            "roles 2",
            "roles 10"
        ],
        description: "List all the roles from this guild.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_ROLES",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Define page vars
        const pages = [];
        let page = 0;

        // Sort the roles by position
        const sorted = message.guild.roles.cache.sort((a, b) => b.position - a.position).array();

        // Devide the roles into pages of 10
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // If args[0] is a number set it as the page
        if (!isNaN(args[0]))
            page = args[0] -= 1;
        // If the page doesn't exist return an error
        if (!pages[page])
            return message.error("You didn't specify a valid page!");

        // Format the description
        const description = pages[page].map(r => `${r} | **ID:** ${r.id} | **${r.members.size}** member(s)`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Roles of ${message.guild.name}`, message.guild.iconURL({ format: "png", dynamic: true }))
            .setFooter(`${sorted.length} total roles | Page ${page + 1} of ${pages.length}`)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(description);

        // Send the embed
        message.channel.send(embed);

    }
};