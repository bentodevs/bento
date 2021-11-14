module.exports = {
    info: {
        name: 'createsticker',
        aliases: ['sticker', 'cs'],
        usage: 'createsticker [url | message id | attachment | sticker] <emoji> <name>',
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
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        // If no args were specified & no attachment was added return the help embed
        if (!message.attachments.size && !args[0]) return bot.commands.get('help').run(bot, message, ['createsticker']);
    },
};
