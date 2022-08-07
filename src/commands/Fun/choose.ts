import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { InteractionResponseUtils } from '../../modules/utils/TextUtils';

const command: Command = {
    info: {
        name: 'choose',
        usage: 'choose <"option 1"| "option 2" | ...>',
        examples: [
            'choose 1 | 2 | 3',
            'choose heads | tails',
        ],
        description: 'Randomly chooses an option for you.',
        category: 'Fun',
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
            name: 'options',
            type: ApplicationCommandOptionType.String,
            description: "A list of options to pick from seperated by |'s",
            required: true,
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Split the options into an array
        const options = (interaction.options.get('options')?.value as string)?.split('|');

        // If no options were specified or all options are the same return an error
        if (options.every((val, i, arr) => val.trim() === arr[0].trim())) return InteractionResponseUtils.error(interaction, "You didn't really specify any options there?", true);

        // Choose a random option
        const choice = Math.floor((Math.random() * options.length));

        // Send the chosen option
        interaction.reply(`🤔 I choose ${options[choice].trim()}`);
    },
};

export default command;
