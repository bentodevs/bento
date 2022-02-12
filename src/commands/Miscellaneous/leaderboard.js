import { MessageEmbed } from 'discord.js';
import { getGuildMemberData } from '../../modules/functions/leveling.js';

export default {
    info: {
        name: 'leaderboard',
        aliases: ['lb'],
        usage: 'leaderboard [page]',
        examples: ['leaderboard', 'leaderboard 2'],
        description: 'View leaderboard statistics for levels',
        category: 'Miscellaneous',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
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
        // Filter out all guilds except this one
        const filtered = await getGuildMemberData(message.guild);

        // Create the page variables
        const pages = [];
        let page = 0;

        // Sort the filtered data by message count
        let sorted = filtered.sort((a, b) => b.guilds[0].leveling.level - a.guilds[0].leveling.level);

        // Format the data
        sorted = sorted.map((member, i) => `**${i + 1}.** ${member.usernames[0].username} - Level ${member.guilds[0].leveling.level}`);

        // Loop through the sorted data & divide it into pages
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // If a page is specified, then set it
        // eslint-disable-next-line no-multi-assign, no-param-reassign
        if (!isNaN(args[0])) page = args[0] -= 1;

        // If the page doesn't exist, then return an error
        if (!pages[page]) return message.errorReply(`That page doesn't exist - You should specify a number between 1 and ${pages.length}!`);

        const embed = new MessageEmbed()
            .setAuthor({ name: `Level leaderboard for ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true, format: 'png' }) })
            .setColor(message.member.displayHexColor ?? bot.config.general.embedColor)
            .setDescription(pages[page].join('\n'))
            .setFooter({ text: `Page ${page + 1} of ${pages.length}` });

        message.channel.send({ embeds: [embed] });
    },

};
