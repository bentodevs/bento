const { MessageEmbed } = require('discord.js');

module.exports = {
    info: {
        name: 'banlist',
        aliases: [
            'blist',
            'bans',
        ],
        usage: 'banlist [page]',
        examples: [
            'banlist 2',
            'banlist 5',
        ],
        description: 'Displays a list of banned users in this guild.',
        category: 'Information',
        info: null,
        options: [],
    },
    perms: {
        permission: 'BAN_MEMBERS',
        type: 'discord',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'page',
            type: 'INTEGER',
            description: 'The page you want to view.',
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        // Fetch all the bans
        const bans = await message.guild.bans.fetch().then((b) => Array.from(b.values())).catch(() => {});

        // If the guild has no bans return an error
        if (!bans?.length) return message.errorReply("This guild doesn't have any bans!");

        // Page Vars
        const pages = [];
        let page = 0;

        // Loop through the boosters and seperate them into pages of 10
        for (let i = 0; i < bans.length; i += 10) {
            pages.push(bans.slice(i, i + 10));
        }

        // If the page option is there set it as the page
        if (!Number.isNaN(args[0])) page = args[0] - 1;
        // If the page doesn't exist retrun an error
        if (!pages[page]) return message.errorReply("You didn't specify a valid page!");

        // Format the data
        const description = pages[page].map((b) => `\`${b.user.username}#${b.user.discriminator}\` | **ID:** ${b.user.id}`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Banned user of ${message.guild.name}`, message.guild.iconURL({ format: 'png', dynamic: true }))
            .setFooter(`${bans.length} total bans | Page ${page + 1} of ${pages.length}`)
            .setColor(message.member?.displayColor || bot.config.general.embedColor)
            .setDescription(description.join('\n'));

        // Send the embed
        message.reply({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Fetch all the bans
        const bans = await interaction.guild.bans.fetch().then((b) => Array.from(b.values())).catch(() => {});

        // If the guild has no bans return an error
        if (!bans.length || !bans) return interaction.error("This guild doesn't have any bans!");

        // Page Vars
        const pages = [];
        let page = 0;

        // Loop through the boosters and seperate them into pages of 10
        for (let i = 0; i < bans.length; i += 10) {
            pages.push(bans.slice(i, i + 10));
        }

        // If the page option is there set it as the page
        // eslint-disable-next-line no-unsafe-optional-chaining
        if (interaction.options.get('page')?.value) page = interaction.options.get('page')?.value - 1;
        // If the page doesn't exist retrun an error
        if (!pages[page]) return interaction.error("You didn't specify a valid page!");

        // Format the data
        const description = pages[page].map((b) => `\`${b.user.username}#${b.user.discriminator}\` | **ID:** ${b.user.id}`);

        console.log(description);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Banned user of ${interaction.guild.name}`, interaction.guild.iconURL({ format: 'png', dynamic: true }))
            .setFooter(`${bans.length} total bans | Page ${page + 1} of ${pages.length}`)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(description.join('\n'));

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};
