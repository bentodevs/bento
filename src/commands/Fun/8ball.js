module.exports = {
    info: {
        name: '8ball',
        aliases: ['8'],
        usage: '8ball <question>',
        examples: [
            '8ball is today a good day?',
        ],
        description: 'Ask the 8ball questions.',
        category: 'Fun',
        info: 'A list of possible answers can be found [here](https://en.wikipedia.org/wiki/Magic_8-Ball#Possible_answers).',
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
            name: 'question',
            type: 'STRING',
            description: 'A question to ask the 8ball.',
            required: true,
        }],
    },

    run: async (bot, message) => {
        // All possible 8ball answers (taken from https://en.wikipedia.org/wiki/Magic_8-Ball#Possible_answers)
        const answers = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes, definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            "Don't count on it.",
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.',
        ];

        // Get a random answer
        const result = Math.floor((Math.random() * answers.length));

        // Send the answer
        message.reply(`🎱 ${answers[result]}`);
    },
};
