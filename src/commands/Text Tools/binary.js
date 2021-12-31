import { MessageEmbed, Util } from 'discord.js';

export default {
    info: {
        name: 'binary',
        aliases: ['bin'],
        usage: 'binary <"encode" | "decode"> <text>',
        examples: [
            'binary encode kek, jarno bald',
        ],
        description: 'Encodes or decodes text in [Binary](https://en.wikipedia.org/wiki/Binary)',
        category: 'Text Tools',
        info: null,
        options: [
            '`encode` - Encode a string to Binary',
            '`decode` - Decode a Binary sring',
        ],
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
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        if (args[0].toLowerCase() === 'encode') {
            if (!args[1]) return message.errorReply('You must specify something to encode to binary!');

            const converted = args.slice(1).join(' ').toBinary();

            const split = await Util.splitMessage(converted, { maxLength: 4000, char: ' ' });

            for (const data of split) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: 'Binary encoded string', iconURL: 'https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1' })
                    .setColor(message.member?.displayColor || bot.config.general.embedColor)
                    .setDescription(`\`\`\`${data}\`\`\``);

                if (data === split[0]) {
                    message.reply({ embeds: [embed] });
                } else {
                    message.channel.send({ embeds: [embed] });
                }
            }
        } else if (args[0].toLowerCase() === 'decode') {
            if (!parseInt(args.slice(1).join(''), 10) || !args[1]) return message.errorReply('You must specify a valid binary string!');

            const converted = args.slice(1).join(' ').binToClear();

            if (!converted) return message.errorReply("You didn't specify a string that I can convert!");

            const split = await Util.splitMessage(converted, { maxLength: 4000, char: ' ' });

            for (const data of split) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: 'Binary decoded string', iconUrl: 'https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1' })
                    .setColor(message.member?.displayColor || bot.config.general.embedColor)
                    .setDescription(`\`\`\`${data}\`\`\``);

                if (data === split[0]) {
                    message.reply({ embeds: [embed] });
                } else {
                    message.channel.send({ embeds: [embed] });
                }
            }
        } else {
            message.errorReply('You must specify either `encode` or `decode`');
        }
    },
};
