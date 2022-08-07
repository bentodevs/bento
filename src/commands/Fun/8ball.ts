import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';

const command: Command = {
    info: {
        name: '8ball',
        usage: '8ball <question>',
        examples: [
            '8ball is today a good day?',
        ],
        description: 'Ask the 8ball questions.',
        category: 'Fun',
        information: 'A list of possible answers can be found [here](https://en.wikipedia.org/wiki/Magic_8-Ball#Possible_answers).',
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
            name: 'question',
            type: ApplicationCommandOptionType.String,
            description: 'A question to ask the 8ball.',
            required: true,
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
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
        interaction.reply(`🎱 ${answers[result]}`);
    },
};

export default command;
