import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export default {
    info: {
        name: 'fox',
        aliases: [],
        usage: '',
        examples: [],
        description: 'Get a random image of a fox.',
        category: 'Fun',
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
        enabled: true,
        opts: [],
    },

    run: async (bot, message) => {
        // Fetch a random fox image and convert the response into json
        const req = await fetch('https://randomfox.ca/floof/');
        const res = await req.json();

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(res.image)
            .setColor(message.member?.displayColor || bot.config.general.embedColor);

        // Send the embed
        message.reply({ embeds: [embed] });
    },
};
