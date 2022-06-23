import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';

export default {
    info: {
        name: 'animal',
        usage: 'animal <"cat" | "dog" | "fox" | "shibe">',
        examples: [
            'animal shibe',
        ],
        description: 'Get a random image of a cat, dog, fox, or shibe.',
        category: 'Fun',
        info: null,
        selfPerms: [
            Permissions.FLAGS.EMBED_LINKS,
        ],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        opts: [{
            name: 'type',
            type: 'STRING',
            description: 'The type of animal you want to get an image of.',
            required: true,
            choices: [
                { name: 'Cat', value: 'cat' },
                { name: 'Dog', value: 'dog' },
                { name: 'Fox', value: 'fox' },
                { name: 'Shibe', value: 'shibe' },
            ],
        }],
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Get the animal type
        const animal = interaction.options.get('type').value;

        const embed = new MessageEmbed();

        if (animal === 'cat') {
            // Fetch a random cat image and convert the response into a buffer
            const req = await fetch('https://aws.random.cat/meow');
            const json = await req.json();

            // Build the embed
            embed.setImage(json.file);
            embed.setColor(interaction.member?.displayColor || bot.config.general.embedColor);
        } else if (animal === 'dog') {
            const req = await fetch('https://random.dog/woof.json');
            const res = await req.json();

            // Build the embed
            embed.setImage(res.url);
            embed.setColor(interaction.member?.displayColor || bot.config.general.embedColor);
        } else if (animal === 'fox') {
            // Fetch a random fox image and convert the response into json
            const req = await fetch('https://randomfox.ca/floof/');
            const res = await req.json();

            // Build the embed
            embed.setImage(res.image);
            embed.setColor(interaction.member?.displayColor || bot.config.general.embedColor);
        } else if (animal === 'shibe') {
            // Fetch a random shibe image and convert the response into json
            const req = await fetch('http://shibe.online/api/shibes');
            const res = await req.json();

            // Build the embed
            embed.setImage(res[0]);
            embed.setColor(interaction.member?.displayColor || bot.config.general.embedColor);
        }

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};
