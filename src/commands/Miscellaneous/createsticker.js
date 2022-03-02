export default {
    info: {
        name: 'createsticker',
        aliases: ['sticker', 'cs'],
        usage: 'createsticker [url | attachment | sticker] <emoji> <name>',
        examples: [
            'createsticker <sticker> :open_mouth: poggers',
            'createsticker https://i.imgur.com/H2RlRVJ.gif :cat: catjam',
        ],
        description: 'Create a sticker from a URL, message id, attachment or existing sticker.',
        category: 'Miscellaneous',
        info: 'To create stickers, the guild must be boosted - This is a requirement by Discord.',
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
        // Regex variables
        const unicodeEmote = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi.exec(message.cleanContent);
        const url = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi.exec(message.cleanContent);

        if (message.stickers?.size) {
            if (!args[0]) {
                const sticker = await message.stickers.first().fetch();

                message.guild.stickers.create(sticker.url, sticker.name, sticker.tags[0])
                    .then((createdSticker) => message.confirmationReply(`Successfully created the sticker: \`${createdSticker.name}\``))
                    .catch((err) => message.errorReply(`Something went wrong: \`${err}\``));
            } else if (args[0]) {
                const sticker = await message.stickers.first().fetch();

                let stickerURL; let name; let
                    emoji;

                if (url) {
                    stickerURL = url[0];
                } else if (message.attachments.size > 0) {
                    stickerURL = message.attachments.first().url;
                } else if (sticker) {
                    stickerURL = sticker.url;
                }

                console.log(stickerURL);

                /* message.guild.stickers.create(stickerURL, args.slice(2).join(' ').trim() ?? sticker.name, unicodeEmote[0] ?? sticker.tags[0])
                    .then((createdSticker) => message.confirmationReply(`Successfully created the sticker: \`${createdSticker.name}\``))
                    .catch((err) => message.errorReply(`Something went wrong: \`${err}\``)); */
            }
        } else if (args[0]) {
            let stickerURL; let name; let
                emoji;

            if (url) {
                stickerURL = url[0];
            } else if (message.attachments.size > 0) {
                stickerURL = message.attachments.first().url;
            }

            if (unicodeEmote) {
                emoji = unicodeEmote[0];
            } else {
                emoji = ':robot:';
            }

            console.log(stickerURL);

            /* message.guild.stickers.create(stickerURL, args.slice(2).join(' ').trim() ?? sticker.name, unicodeEmote[0] ?? sticker.tags[0])
                    .then((createdSticker) => message.confirmationReply(`Successfully created the sticker: \`${createdSticker.name}\``))
                    .catch((err) => message.errorReply(`Something went wrong: \`${err}\``)); */
        }
    },
};
