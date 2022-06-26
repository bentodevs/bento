import { codeBlock } from '@discordjs/builders';
import { MessageEmbed, Permissions } from 'discord.js';
import flip from 'flip';
import config from '../../config.js';

export default {
    info: {
        name: 'text',
        usage: '',
        examples: [],
        description: 'Modifiy and apply effects to text.',
        category: 'Miscellaneous',
        info: null,
        selfPerms: [
            Permissions.FLAGS.EMBED_LINKS,
        ],
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
            name: 'base64',
            type: 'SUB_COMMAND',
            description: 'Encode and Decode text using Base64',
            options: [{
                name: 'operation',
                type: 'STRING',
                description: 'Choose whether to encode or decode text',
                required: true,
                choices: [
                    { name: 'Encode', value: 'encode' },
                    { name: 'Decode', value: 'decode' },
                ],
            }, {
                name: 'text',
                type: 'STRING',
                description: 'The text to encode to, or decode from, Base64',
                required: true,
            }],
        }, {
            name: 'binary',
            type: 'SUB_COMMAND',
            description: 'Encode and Decode text as Binary',
            options: [{
                name: 'operation',
                type: 'STRING',
                description: 'Choose whether to encode or decode text',
                required: true,
                choices: [
                    { name: 'Encode', value: 'encode' },
                    { name: 'Decode', value: 'decode' },
                ],
            }, {
                name: 'text',
                type: 'STRING',
                description: 'The text to encode to, or decode from, Binary',
                required: true,
            }],
        }, {
            name: 'flip',
            type: 'SUB_COMMAND',
            description: 'Flip some text upside-down',
            options: [{
                name: 'text',
                type: 'STRING',
                description: 'The text to flip',
                required: true,
            }],
        }, {
            name: 'reverse',
            type: 'SUB_COMMAND',
            description: 'Reverse some text',
            options: [{
                name: 'text',
                type: 'STRING',
                description: 'The text to reverse',
                required: true,
            }],
        }, {
            name: 'shuffle',
            type: 'SUB_COMMAND',
            description: 'Shuffle words in some text',
            options: [{
                name: 'text',
                type: 'STRING',
                description: 'The text to shuffle',
                required: true,
            }],
        }],
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        const subCmd = interaction.options.getSubcommand();
        const op = interaction.options.get('operation')?.value;
        const text = interaction.options.get('text').value;

        let output;

        if (subCmd === 'base64') {
            if (op === 'encode') {
                output = Buffer.from(text).toString('base64');
            } else {
                output = Buffer.from(text, 'base64').toString();
            }

            const embed = new MessageEmbed()
                .setAuthor({ name: `Base64 ${op === 'encode' ? 'encoded' : 'decoded'} text`, iconURL: 'https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1' })
                .setColor(interaction?.member?.displayColor ?? config.general.displayColor)
                .setDescription(codeBlock(output));

            interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subCmd === 'binary') {
            if (op === 'encode') {
                output = text.toBinary();
            } else {
                output = text.binToClear();
            }

            const embed = new MessageEmbed()
                .setAuthor({ name: `Binary ${op === 'encode' ? 'encoded' : 'decoded'} text`, iconURL: 'https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1' })
                .setColor(interaction?.member?.displayColor ?? config.general.displayColor)
                .setDescription(codeBlock(output));

            interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subCmd === 'flip') {
            interaction.reply({ content: flip(text.cleanEmotes()), ephemeral: true });
        } else if (subCmd === 'reverse') {
            interaction.reply({ content: text.reverseText(), ephemeral: true });
        } else if (subCmd === 'shuffle') {
            interaction.reply({ content: text.shuffle().join(' '), ephemeral: true });
        }
    },
};
