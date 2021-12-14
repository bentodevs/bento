export default {
    info: {
        name: 'ping',
        aliases: ['pong'],
        usage: null,
        examples: [],
        description: 'Displays the time between your message and the bots response.',
        category: 'Information',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: [],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message) => {
        // Send a message, once the message is sent edit it with the ping information
        message.reply('Never gonna give you up, never gonna let you down...')
            .then((msg) => msg.edit(`:ping_pong: **Time:** ${Math.round(msg.createdTimestamp - message.createdTimestamp)} ms\n:heart: **Heartbeat:** ${Math.round(bot.ws.ping)}ms`));
    },
};
