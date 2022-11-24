import {
    ApplicationCommandOptionType, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../data/constants';
import { request } from 'undici';

const command: Command = {
    info: {
        name: 'animal',
        usage: 'animal <"cat" | "dog" | "fox" | "shibe">',
        examples: [
            'animal shibe',
        ],
        description: 'Get a random image of a cat, dog, fox, or shibe.',
        category: 'Fun',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
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
            type: ApplicationCommandOptionType.String,
            description: 'The type of animal you want to get an image of.',
            required: true,
            choices: [
                { name: 'Cat', value: 'cat' },
                { name: 'Dog', value: 'dog' },
                { name: 'Fox', value: 'fox' },
                { name: 'Shibe', value: 'shibe' },
            ],
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Get the animal type
        const animal = interaction.options.get('type')?.value;

        const embed = new EmbedBuilder()
            .setColor((interaction?.member as GuildMember).displayHexColor ?? DEFAULT_COLOR);

        if (animal === 'cat') {
            const { body } = await request('https://aws.random.cat/meow');
            const data: { file: string } = await body.json();

            embed.setImage(data.file);
        } else if (animal === 'dog') {
            const { body } = await request('https://random.dog/woof.json');
            const data: { url: string } = await body.json();

            embed.setImage(data.url);
        } else if (animal === 'fox') {
            const { body } = await request('https://randomfox.ca/floof/');
            const data: { image: string } = await body.json();

            embed.setImage(data.image);
        } else if (animal === 'shibe') {
            const { body } = await request('http://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true');
            const data: string[] = await body.json();

            embed.setImage(data[0]);
        }

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
