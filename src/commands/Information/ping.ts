import { Command } from '../../modules/interfaces/cmd';

const command: Command = {
    info: {
        name: 'ping',
        usage: '',
        examples: [],
        description: 'Displays the time between your message and the bots response.',
        category: 'Information',
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
        defaultPermission: false,
        dmPermission: true,
    },

    run: async (bot, interaction) => {
        // Send a message, once the message is sent edit it with the ping information
        await interaction.reply(`:heart: **Heartbeat:** ${Math.round(bot.ws.ping)}ms`);
    },
};

export default command;
