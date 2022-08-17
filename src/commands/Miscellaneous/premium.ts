import { Command } from '../../modules/interfaces/cmd.js';
import { SUPPORT_SERVER } from '../../modules/structures/constants.js';

const command: Command = {
    info: {
        name: 'premium',
        usage: '',
        examples: [],
        description: 'Check your premium status.',
        category: 'Utility',
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
            message: false,
            user: false
        },
        opts: [],
        dmPermission: false,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        return interaction.reply({ content: `Bento Premium is coming soon - Keep an eye on our Support Server for more information!\n${SUPPORT_SERVER}`, ephemeral: true });
    },
};

export default command;
