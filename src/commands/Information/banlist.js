const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "banlist",
        aliases: [
            "blist",
            "bans"
        ],
        usage: "banlist [page]",
        examples: [
            "banlist 2",
            "banlist 5"
        ],
        description: "Displays a list of banned users in this guild.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: "BAN_MEMBERS",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Fetch all the bans
        const bans = await message.guild.fetchBans().then(bans => { return bans.array(); }).catch(() => {});

        // If the guild has no bans return an error
        if (!bans.length || !bans)
            return message.error("This guild doesn't have any bans!");

        // Page Vars
        const pages = [];
        let page = 0;

        // Loop through the boosters and seperate them into pages of 10
        for (let i = 0; i < bans.length; i += 10) {
            pages.push(bans.slice(i, i + 10));
        }

        // If args[0] is a number set it as the page
        if (!isNaN(args[0])) 
            page = args[0] - 1;
        // If the page doesn't exist retrun an error
        if (!pages[page])
            return message.error("You didn't specify a valid page!");

        // Format the data
        const description = pages[page].map(b => `\`${b.user.username}#${b.user.discriminator}\` | **ID:** ${b.user.id}`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Banned user of ${message.guild.name}`, message.guild.iconURL({ format: "png", dynamic: true }))
            .setFooter(`${bans.length} total bans | Page ${page + 1} of ${pages.length}`)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(description);

        // Send the embed
        message.channel.send(embed);

    }
};