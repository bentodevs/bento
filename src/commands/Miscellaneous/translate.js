import translate from '@vitalets/google-translate-api';
import ISO from 'iso-639-1';
import { MessageEmbed } from 'discord.js';

export default {
    info: {
        name: 'translate',
        aliases: [
            'tl',
        ],
        usage: 'translate [destination language] <text>',
        examples: [
            'translate german Hi, I am Jarno',
            'translate Hallo, ich bin Jarno',
        ],
        description: 'Translates text to a certain laguage.',
        category: 'Miscellaneous',
        info: 'Translates to English if no language or a invalid language was specified.',
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
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
            description: 'The text you want to translate.',
            required: true,
        }, {
            name: 'destination_language',
            type: 'STRING',
            description: 'The language you want to translate the text too.',
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        // Get the language and the text to translate
        const language = translate.languages[args[0].toLowerCase()] || Object.values(translate.languages).find((a) => (typeof (a) === 'string' ? a.toLowerCase() === args[0].toLowerCase() : ''));
        const toTranslate = language ? args.slice(1).join(' ') : args.join(' ');

        // Translate the text
        const result = await translate(toTranslate, {
            to: language ?? 'en',
        });

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Translated From: ${ISO.getName(result.from.language.iso)}`)
            .setThumbnail('https://i.imgur.com/Lg3ZDtn.png')
            .setColor(message.member?.displayColor || bot.config.general.embedColor)
            .addField(`Original (${ISO.getName(result.from.language.iso)})`, toTranslate)
            .addField(`Translated (${translate.languages[language] ? ISO.getName(language) : language ?? 'English'})`, result.text);

        // Send the embed
        message.reply({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Get the language and the text to translate
        const language = translate.languages[interaction.options.get('destination_language')?.value?.toLowerCase()] || Object.values(translate.languages).find((a) => (typeof (a) === 'string' ? a.toLowerCase() === interaction.options.get('destination_language')?.value?.toLowerCase() : ''));
        const toTranslate = interaction.options.get('text').value;

        // Translate the text
        const result = await translate(toTranslate, {
            to: language ?? 'en',
        });

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Translated From: ${ISO.getName(result.from.language.iso)}`)
            .setThumbnail('https://i.imgur.com/Lg3ZDtn.png')
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .addField(`Original (${ISO.getName(result.from.language.iso)})`, toTranslate)
            .addField(`Translated (${translate.languages[language] ? ISO.getName(language) : language ?? 'English'})`, result.text);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};
