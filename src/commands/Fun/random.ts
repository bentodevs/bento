import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'random',
        usage: 'random [number]',
        examples: [
            'random 100',
            'random 10',
        ],
        description: 'Picks a random number between 1 and the number you specify.',
        category: 'Fun',
        information: 'If no number is specified it will default to 100.',
        selfPerms: [],
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
            name: 'number',
            type: ApplicationCommandOptionType.Number,
            description: 'A number.',
            required: false,
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Get the number
        const number = (interaction.options.get('number')?.value as number) ?? 100;

        // If the number is 0 or lower return an error
        if (number <= 0) return InteractionResponseUtils.error(interaction, 'Please enter a number above 0!', true);
        // If the number is above 1 trillion return an error
        if (number > Number.MAX_SAFE_INTEGER) return InteractionResponseUtils.error(interaction, `Please enter a number below **${Number.MAX_SAFE_INTEGER.toLocaleString()}**!`, true);

        // Get the random number
        const result = Math.floor(Math.random() * number + 1);

        // Send the random number
        InteractionResponseUtils.confirmation(interaction, `The random number I picked is **${result.toLocaleString()}**!`, false);
    },
};

export default command;
