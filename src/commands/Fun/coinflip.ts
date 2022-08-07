import { Command } from '../../modules/interfaces/cmd';

const command: Command = {
    info: {
        name: 'coinflip',
        usage: '',
        examples: [],
        description: 'Flips a coin.',
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
        opts: [],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Get a random number between 0 and 1, if the number is 1 pick heads otherwise pick tails
        const random = Math.floor(Math.random() * 2);
        const result = random === 1 ? 'heads' : 'tails';

        // Send a message with the result
        interaction.reply(`🪙 The coin landed on **${result}**!`);
    },
};

export default command;
