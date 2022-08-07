import { getDadjoke } from '../../modules/functions/misc.js';
import { Command } from '../../modules/interfaces/cmd.js';

const command: Command = {
    info: {
        name: 'dadjoke',
        usage: '',
        examples: [],
        description: 'Sends a random dad joke.',
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
        getDadjoke().then((joke) => interaction.reply(joke.joke));
    },
};

export default command;
