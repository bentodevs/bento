import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export default {
    info: {
        name: 'emoji',
        aliases: ['emote', 'eminfo'],
        usage: 'emoji <emoji>',
        examples: ['emote :kekw:', 'emote :copium:'],
        description: 'Get information about a Discord emoji',
        category: 'Information',
        info: null,
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
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        const customEmote = /<a?:(\w+):(\d+)>/gi.exec(message.cleanContent);
        const unicodeEmoji = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.exec(message.cleanContent);

        if (customEmote) {
            const URL = `https://cdn.discordapp.com/emojis/${customEmote[2]}${customEmote[0].startsWith('<a') ? '.gif' : '.png'}`;

            console.log(customEmote[0]);
            console.log(customEmote[2]);

            const embed = new MessageEmbed()
                .setAuthor(`Emoji Info - :${customEmote[1]}:`, URL)
                .setThumbnail(URL)
                .setDescription(stripIndents`**Emoji Name:** ${customEmote[1]}
                **Emoji ID:** ${customEmote[2]}
                **API Format:** \`${customEmote[0].normalize()}\``);

            message.reply({ embeds: [embed] });
            message.channel.send(`\`\`\`${customEmote[0]}\`\`\``);
        } else if (unicodeEmoji) {

        } else {

        }
    },
};
