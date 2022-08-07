import {
    ApplicationCommandOptionType, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import fetch, { Response } from 'node-fetch';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';

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
            fetch('https://aws.random.cat/meow')
                .then((res: Response) => res.json())
                .then((data: { file: string }) => embed.setImage(data.file));
        } else if (animal === 'dog') {
            fetch('https://random.dog/woof.json')
                .then((res: Response) => res.json())
                .then((data: { fileSizeBytes: number, url: string }) => embed.setImage(data.url));
        } else if (animal === 'fox') {
            fetch('https://randomfox.ca/floof/')
                .then((res: Response) => res.json())
                .then((data: { image: string, link: string }) => embed.setImage(data.image));
        } else if (animal === 'shibe') {
            fetch('http://shibe.online/api/shibes')
                .then((res: Response) => res.json())
                .then((data: string[]) => embed.setImage(data[0]));
        }

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
