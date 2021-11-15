const flip = require('flip');

module.exports = {
    info: {
        name: 'flip',
        aliases: [],
        usage: 'flip <text>',
        examples: [],
        description: 'Flip (or unflip) text.',
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
            description: 'The text you want to flip.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // Check if the message isn't too long
        if ((args?.join(' ').length ?? message.options.get('text').value.length) >= 2000) return message.error('Your message was too long!');

        // Send the flipped text
        message.reply(`${flip(args?.join(' ').cleanEmotes()) ?? flip(message.options.get('text').value.cleanEmotes())}`);
    },
};
