import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';

const command: Command = {
    info: {
        name: 'rps',
        usage: 'rps <"rock" | "paper" | "scissors">',
        examples: [
            'rps paper',
        ],
        description: 'Play a game of rock paper scissors against R2-D2!',
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
            name: 'option',
            type: ApplicationCommandOptionType.String,
            description: 'Rock, paper or scissors.',
            required: true,
            choices: [
                { name: 'Rock', value: 'rock' },
                { name: 'Paper', value: 'paper' },
                { name: 'Scissors', value: 'scissors' },
            ],
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Define the different options & formatted versions of them
        const options = [
            'scissors',
            'rock',
            'paper',
        ];
        const formatted = [
            'scissors ✌️',
            'rock ✊',
            'paper ✋',
        ];

        // Get the userPick and the botPick
        const userPick = options.indexOf((interaction.options.get('option')?.value as string));
        const botPick = Math.floor(Math.random() * 3);

        // Check who won
        if (userPick === botPick) {
            return interaction.reply(`I chose **${formatted[botPick]}**, its a draw!`);
        } if (botPick > userPick || (botPick === 0 && userPick === 2)) {
            interaction.reply(`I chose **${formatted[botPick]}**, I win!`);
        } else {
            interaction.reply(`I chose **${formatted[botPick]}**, you win!`);
        }
    },
};

export default command;
