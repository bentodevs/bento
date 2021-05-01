const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "emotes",
        aliases: [],
        usage: "emotes [page]",
        examples: [
            "emotes 2",
            "emotes 5"
        ],
        description: "List all emotes in this guild.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_EMOJIS",
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

        // Define pages vars
        const pages = [];
        let page = 0;

        // Grab the emotes and sort them
        const emotes = message.guild.emojis.cache,
        sorted = emotes.sort((a, b) => b.position - a.position).array();

        // Devide the emotes into pages of 10
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // If args[0] is a number set it as the page
        if (!Number.isNaN(args[0]))
            page = args[0] -= 1;
        // If the page doesn't exist return an error
        if (!pages[page])
            return message.error("You didn't specify a valid page!");

        // Prepare the description
        const description = pages[page].map(a => `${a} | **Name:** ${a.name} | **ID:** ${a.id} `);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Emotes of ${message.guild.name}`, message.guild.iconURL({ format: "png", dynamic: true }))
            .setFooter(`${emotes.size} total emotes | Page ${page + 1} of ${pages.length}`)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(description);

        // Send the embed
        message.channel.send(embed);

    }
};