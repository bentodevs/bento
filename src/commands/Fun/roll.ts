import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'roll',
        usage: 'roll [sides]',
        examples: [
            'roll 6',
            'roll 20',
        ],
        description: 'Rolls a dice with the specified number of sides.',
        category: 'Fun',
        information: 'If no number is specified it will default to 6 sides.',
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
            name: 'sides',
            type: ApplicationCommandOptionType.Number,
            description: 'A number.',
            required: false,
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Get the number
        const number = (interaction.options.get('sides')?.value as number) ?? 6;

        // If the number is 0 or lower return an error
        if (number <= 0) return InteractionResponseUtils.error(interaction, 'Please enter a number above 0!', true);
        // If the number is above 1 trillion return an error
        if (number > Number.MAX_SAFE_INTEGER) return InteractionResponseUtils.error(interaction, `Please enter a number below **${Number.MAX_SAFE_INTEGER.toLocaleString()}**!`, true);

        // Get the result
        const result = Math.floor(Math.random() * number + 1);

        // Send the result
        InteractionResponseUtils.confirmation(interaction, `You rolled a **${result}**!`, false);
    },
};

export default command;
