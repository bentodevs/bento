import { translate } from '@vitalets/google-translate-api';
import ISO from 'iso-639-1';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../data/constants';

const command: Command = {
    info: {
        name: 'translate',
        usage: 'translate [destination language] <text>',
        examples: [
            'translate german Hi, I am Jarno',
            'translate Hallo, ich bin Jarno',
        ],
        description: 'Translates text to a certain laguage.',
        category: 'Miscellaneous',
        information: 'Translates to English if no language or a invalid language was specified.',
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
            name: 'text',
            type: ApplicationCommandOptionType.String,
            description: 'The text you want to translate.',
            required: true,
        }, {
            name: 'destination_language',
            description: 'The language you want to translate the text too.',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: false
        }],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the language and the text to translate
        const language = interaction.options.getString('destination_language') || "en";
        const toTranslate = interaction.options.getString('text', true);

        // Translate the text
        const result = await translate(toTranslate, {
            to: language ?? 'en',
        });

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Translated From: ${ISO.getName(result.raw.ld_result.srclangs[0])}` })
            .setThumbnail('https://i.imgur.com/Lg3ZDtn.png')
            .setColor(DEFAULT_COLOR)
            .addFields([{
                name: `Original (${ISO.getName(result.raw.ld_result.srclangs[0])})`,
                value: toTranslate,
            }, {
                name: `Translated (${ISO.getName(language)})`,
                value: result.text,
            }]);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
