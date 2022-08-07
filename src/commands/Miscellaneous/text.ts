import {
    ApplicationCommandOptionType, ChatInputCommandInteraction, codeBlock, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import flip from 'flip';
import { shuffle } from '../../modules/functions/misc';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';
import { StringUtils } from '../../modules/utils/TextUtils';

const command: Command = {
    info: {
        name: 'text',
        usage: '',
        examples: [],
        description: 'Modifiy and apply effects to text.',
        category: 'Miscellaneous',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
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
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Encode and Decode text using Base64',
            options: [{
                name: 'operation',
                type: ApplicationCommandOptionType.String,
                description: 'Choose whether to encode or decode text',
                required: true,
                choices: [
                    { name: 'Encode', value: 'encode' },
                    { name: 'Decode', value: 'decode' },
                ],
            }, {
                name: 'text',
                type: ApplicationCommandOptionType.String,
                description: 'The text to encode to, or decode from, Base64',
                required: true,
            }],
        }, {
            name: 'binary',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Encode and Decode text as Binary',
            options: [{
                name: 'operation',
                type: ApplicationCommandOptionType.String,
                description: 'Choose whether to encode or decode text',
                required: true,
                choices: [
                    { name: 'Encode', value: 'encode' },
                    { name: 'Decode', value: 'decode' },
                ],
            }, {
                name: 'text',
                type: ApplicationCommandOptionType.String,
                description: 'The text to encode to, or decode from, Binary',
                required: true,
            }],
        }, {
            name: 'flip',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Flip some text upside-down',
            options: [{
                name: 'text',
                type: ApplicationCommandOptionType.String,
                description: 'The text to flip',
                required: true,
            }],
        }, {
            name: 'reverse',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Reverse some text',
            options: [{
                name: 'text',
                type: ApplicationCommandOptionType.String,
                description: 'The text to reverse',
                required: true,
            }],
        }, {
            name: 'shuffle',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Shuffle words in some text',
            options: [{
                name: 'text',
                type: ApplicationCommandOptionType.String,
                description: 'The text to shuffle',
                required: true,
            }],
        }],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const subCmd = interaction.options.getSubcommand();
        const op = interaction.options.get('operation')?.value;
        const text = interaction.options.getString('text', true);

        let output;

        if (subCmd === 'base64') {
            if (op === 'encode') {
                output = Buffer.from(text).toString('base64');
            } else {
                output = Buffer.from(text, 'base64').toString();
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Base64 ${op === 'encode' ? 'encoded' : 'decoded'} text`, iconURL: 'https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1' })
                .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
                .setDescription(codeBlock(output));

            interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subCmd === 'binary') {
            if (op === 'encode') {
                output = StringUtils.stringToBinary(text);
            } else {
                output = StringUtils.binaryToString(text);
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Binary ${op === 'encode' ? 'encoded' : 'decoded'} text`, iconURL: 'https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1' })
                .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
                .setDescription(codeBlock(output));

            interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subCmd === 'flip') {
            interaction.reply({ content: flip(StringUtils.cleanEmotes(text)), ephemeral: true });
        } else if (subCmd === 'reverse') {
            interaction.reply({ content: StringUtils.reverseText(text), ephemeral: true });
        } else if (subCmd === 'shuffle') {
            const textArray = Array.from(text.split(' '));
            interaction.reply({ content: shuffle(textArray).join(' '), ephemeral: true });
        }
    },
};

export default command;
