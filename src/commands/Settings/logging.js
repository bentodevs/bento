import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import config from '../../config.js';
import settings from '../../database/models/settings.js';

export default {
    info: {
        name: 'logging',
        aliases: [],
        usage: 'logging [setting] [option]',
        examples: [
            'logging moderation #mod-logs',
            'logging channels disable',
        ],
        description: 'Change or view event logging settings.',
        category: 'Settings',
        info: null,
        options: [
            '`moderation` - Logs manual moderation actions (Such as kicks & bans)',
            '`guild` - Logs server-level changes (Server name, icon, etc.)',
            '`channels` - Logs channel modifications, removals and additions',
            '`roles` - Logs role modifications, removals and additions',
            '`members` - Logs user chanes (Profile pictures, etc.), leaves and joins',
        ],
    },
    perms: {
        permission: 'ADMISTRATOR',
        type: 'discord',
        self: [],
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
        const eventLogType = args[0]?.toLowerCase();
        const options = ['moderation', 'guild', 'channels', 'roles', 'members'];

        if (!options.includes(eventLogType)) {
            // Build the state embed
            const embed = new MessageEmbed()
                .setTitle('Event logging')
                .setColor(message.member.displayColor ?? bot.config.general.embedColor)
                .setThumbnail('https://i.imgur.com/iML7LKF.png')
                .setDescription(stripIndents`⚒️ Manual moderation logging is ${message.settings.manual_events.moderation ? '**enabled**' : '**disabled**'}
                    🖥️ Guild modification logging is ${message.settings.manual_events.guild ? '**enabled**' : '**disabled**'}
                    ${config.emojis.channel} Channel modification logging is ${message.settings.manual_events.channels ? '**enabled**' : '**disabled**'}
                    📚 Role modification logging is ${message.settings.manual_events.roles ? '**enabled**' : '**disabled**'}
                    🧑‍🤝‍🧑 Member modification logging is ${message.settings.manual_events.members ? '**enabled**' : '**disabled**'}`);

            // Send the state embed
            message.reply({ embeds: [embed] });
        }

        await settings.findOneAndUpdate({ _id: message.guild.id }, {
            [`manual_events.${eventLogType}`]: !message.settings.manual_events[eventLogType],
        });

        switch (eventLogType) {
        case 'moderation':
            message.confirmationReply(`${eventLogType.toTitleCase()} logging has been **${!message.settings.manual_events[eventLogType] ? 'enabled' : 'disabled'}**`);
            break;
        case 'guild':
        case 'roles':
        case 'members':
        case 'channels':
            message.confirmationReply(`${eventLogType.toTitleCase()} modification logging has been **${!message.settings.manual_events[eventLogType] ? 'enabled' : 'disabled'}**`);
            break;
        default:
            break;
        }
    },
};
