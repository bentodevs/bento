import fetch from 'node-fetch';
import path from 'path';
import { fetchEmote } from '../../modules/functions/misc.js';

export default {
    info: {
        name: 'createemote',
        aliases: ['em', 'ce', 'createemoji'],
        usage: 'createemote [url | emoji | attachment] [name]',
        examples: [
            'createemote :pog: poggers',
            'createemote https://i.imgur.com/H2RlRVJ.gif catjam',
        ],
        description: 'Create an emote from a URL, existing emoji or attachment.',
        category: 'Miscellaneous',
        info: null,
        options: [],
    },
    perms: {
        permission: 'MANAGE_EMOJIS_AND_STICKERS',
        type: 'discord',
        self: ['MANAGE_EMOJIS_AND_STICKERS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        // If no args were specified & no attachment was added return the help embed
        if (!message.attachments.size && !args[0]) return bot.commands.get('help').run(bot, message, ['createemote']);

        // Regex variables
        const emote = /<a?:(\w+):(\d+)>/gi.exec(message.cleanContent);
        const url = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi.exec(message.cleanContent);

        // If no emote, url or attachments were found return an error
        if (!emote && !url && !message.attachments.size) return message.errorReply("You didn't specify a valid URL, attachment or emote!");

        if (emote) {
            // 1. Prepare the emoji URL
            // 2. Fetch the emoji
            const URL = `https://cdn.discordapp.com/emojis/${emote[2]}${emote[0].startsWith('<a') ? '.gif' : '.png'}`;
            const res = await fetch(URL);

            // If the file size is too big return an error
            if (res.headers.get('content-length') > 256 * 1024) return message.errorReply('The emoji is too big! It must be 256KB or less.');

            // Convert the emoji to a buffer and grab the emote name
            const buffer = await res.buffer();
            const name = args.join(' ').replace(emote[0], '').trim() ? args.join(' ').replace(emote[0], '').trim() : emote[1];

            // Create the emoji
            message.guild.emojis.create(buffer, name, {
                reason: `Issued by ${message.author.tag} using the createemote command.`,
            }).then((e) => {
                message.confirmationReply(`Successfully created the emote: \`:${e.name}:\` ${e}`);
            }).catch((err) => {
                message.errorReply(`Failed to create the emote: \`${err}\``);
            });
        } else {
            // Grab the url and fetch the emoji and grab the emote name
            const URL = url?.[0] ? url[0] : message.attachments.first().url;
            const name = args.join(' ').replace(URL, '').trim() ? args.join(' ').replace(URL, '').trim() : path.parse(URL).name;

            // Fetch the emote
            fetchEmote(URL).then((buffer) => {
                // Create the emoji
                message.guild.emojis.create(buffer, name, {
                    reason: `Issued by ${message.author.tag} using the createemote command.`,
                }).then((e) => {
                    message.confirmationReply(`Successfully created the emote: \`:${e.name}:\` ${e}`);
                }).catch((err) => {
                    message.errorReply(`Failed to create the emote: \`${err.message}\``);
                });
            }).catch((err) => message.errorReply(`Failed to create the emote: \`${err.message}\``));
        }
    },
};
