module.exports = {
    info: {
        name: 'shuffle',
        aliases: [],
        usage: 'shuffle <text>',
        examples: [
            'shuffle this is a test',
        ],
        description: 'Shuffles words around in a text.',
        category: 'Text Tools',
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
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'text',
            type: 'STRING',
            description: 'The text you want to be shuffled.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // If there are no args get them from the interaction options
        // eslint-disable-next-line no-param-reassign
        if (!args) { args = message.options.get('text').value.split(/ +/g); }

        // If the user only specified 1 word return an error
        if (args.length === 1) return message.reply(`${bot.config.emojis.error} You must specify at least 2 words!`);

        // Send the shuffled text
        message.reply(args.shuffle().join(' '));
    },
};
