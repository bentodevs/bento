const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const { default: fetch } = require('node-fetch');

module.exports = {
    info: {
        name: 'duckduckgo',
        aliases: ['ddg'],
        usage: 'duckduckgo <search query>',
        examples: ['duckduckgo Elon Musk age'],
        description: 'Fetch an instant answer from DuckDuckGo',
        category: 'Fun',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'discord',
        self: [],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'query',
            type: 'STRING',
            description: 'The search you wish to complete.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // Combine the search phrase with + to form the URL part
        const searchTerm = args.join('+');

        // Fetch the data & convert json
        const req = await fetch(`https://api.duckduckgo.com/?q=${searchTerm}&format=json&t=R2-D2-Discord-Bot-AmirionStudiosLLC`);
        const res = await req.json();

        // If there is no type associated with the data, throw an error
        if (!res.Type) return message.errorReply("I couldn't find any Instant Answers for that query!");

        // Get all the relatedTopic data, get the first 5 entries and map
        const descData = res.RelatedTopics.slice(0, 5).filter((a) => a.FirstURL).map((a) => `**${a.Text}**\n[${a.FirstURL}](${a.FirstURL})\n`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`DuckDuckGo results for: ${args.join(' ')}`, 'https://i.imgur.com/Moe5TI0.png')
            .setThumbnail(res.Image ? `https://api.duckduckgo.com/${res.Image}` : '')
            .setColor(message.member?.displayColor || bot.config.general.embedColor)
            .setDescription(stripIndents`${res.AbstractText ?? ''}

            ${descData.join('\n')}`);

        // Send the embed
        message.reply({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Fetch the raw search query
        // Combine the search phrase with + to form the URL part
        const rawQuery = interaction.options.get('query').value;
        const searchTerm = rawQuery.split(' ').join('+');

        // Fetch the data & convert json
        const req = await fetch(`https://api.duckduckgo.com/?q=${searchTerm}&format=json&t=R2-D2-Discord-Bot-AmirionStudiosLLC`);
        const res = await req.json();

        // If there is no type associated with the data, throw an error
        if (!res.Type) return interaction.error("I couldn't find any Instant Answers for that query!");

        // Get all the relatedTopic data, get the first 5 entries and map
        const descData = res.RelatedTopics.slice(0, 5).filter((a) => a.FirstURL).map((a) => `**${a.Text}**\n[${a.FirstURL}](${a.FirstURL})\n`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`DuckDuckGo results for: ${rawQuery}`, 'https://i.imgur.com/Moe5TI0.png')
            .setThumbnail(res.Image ? `https://api.duckduckgo.com/${res.Image}` : '')
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`${res.AbstractText ?? ''}

            ${descData.join('\n')}`);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};
