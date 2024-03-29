import { Util, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export default {
    info: {
        name: 'lyrics',
        aliases: [],
        usage: 'lyrics [song]',
        examples: [
            'lyrics Grindin NF',
        ],
        description: 'Fetch song lyrics for your current spotify song, or a specified song',
        category: 'Miscellaneous',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        // 1. Fetch the user's Spotify presence data
        // 2. Define the request headers
        const reqHeads = { headers: { authorization: process.env.R2D2_TOKEN } };

        if (message?.guild && !args[0]) {
            const spotifyData = message.member.presence?.activities?.find((a) => a.name.toLowerCase() === 'spotify');

            // 1. Get the song from the API
            // 2. Convert the data to JSON
            const req = await fetch(`https://api.r2-d2.dev/lyrics/${encodeURIComponent(spotifyData.details)}%20${encodeURIComponent(spotifyData.state)}`, reqHeads);
            const res = await req.json();

            // If there is no lyrics element, then return an error
            if (!res?.lyrics) return message.errorReply('I encountered an error fetching lyics for your current song!');

            // Split the content to be a max of 3800 chars (API limit is 4k chars)
            const content = Util.splitMessage(res.lyrics, { maxLength: '3800', char: '\n' });

            // For each element int he content array, send an embed
            for (const data of content) {
                // Build the embed
                const embed = new MessageEmbed()
                    .setAuthor({ name: `${res.title}`, iconUrl: res.image ?? bot.user.displayAvatarURL({ dynamic: true, format: 'png' }) })
                    .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                    .setDescription(`\`\`\`${data}\`\`\``)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true, format: 'png' }) })
                    .setTimestamp();

                if (data === content[0]) {
                    // If this is the first element in the array then reply to the message
                    message.reply({ embeds: [embed] });
                } else {
                    // If this isn't the first element in the array, then just send the embed
                    message.channel.send({ embeds: [embed] });
                }
            }
        } else if (args[0]) {
            // 1. Get the song from the API
            // 2. Conver the data to JSON
            const req = await fetch(`https://api.r2-d2.dev/lyrics/${args.join('%20')}`, reqHeads);
            const res = await req.json();

            // If there is no lyrics element, then return an error
            if (!res?.lyrics) return message.errorReply('I encountered an error fetching lyics for your current song!');

            // Split the content to be a max of 3800 chars (API limit is 4k chars)
            const content = Util.splitMessage(res.lyrics, { maxLength: '3800', char: '\n' });

            for (const data of content) {
                // Build the embed
                const embed = new MessageEmbed()
                    .setAuthor({ name: `${res.title}`, iconUrl: res.image ?? bot.user.displayAvatarURL({ dynamic: true, format: 'png' }) })
                    .setColor(message.member?.displayColor || bot.config.general.embedColor)
                    .setDescription(`\`\`\`${data}\`\`\``)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconUrl: message.author.displayAvatarURL({ dynamic: true, format: 'png' }) })
                    .setTimestamp();

                if (data === content[0]) {
                    // If this is the first element in the array then reply to the message
                    message.reply({ embeds: [embed] });
                } else {
                    // If this isn't the first element in the array, then just send the embed
                    message.channel.send({ embeds: [embed] });
                }
            }
        } else {
            // If the user isn't listening to a song, and didn't specify a song, then return an error
            message.errorReply('You must be listening to a song, or provide a song to fetch lyrics for!');
        }
    },
};
