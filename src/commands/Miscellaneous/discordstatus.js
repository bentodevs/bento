import { stripIndents } from 'common-tags';
import { parseISO, format } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { MessageEmbed } from 'discord.js';
import { getDiscordStatus } from '../../modules/functions/misc.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'discordstatus',
        aliases: [
            'dstatus',
            'apistatus',
        ],
        usage: '',
        examples: [],
        description: "Get Discord's current status.",
        category: 'Miscellaneous',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'discord',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [],
    },

    run: async (bot, message) => {
        // Get the current Discord Status
        const status = await getDiscordStatus();

        // Define the description and incident vars
        let description = `**Last Update:** ${format(parseISO(status.page.updated_at), 'PPp O')}\n\n`;
        let incidents;

        // Add the overall status to the description
        switch (status.status.indicator) {
            case 'major':
                description += `${bot.config.emojis.dnd} **Overall Status:** Major Outage Reported\n\n`;
                break;
            case 'minor':
                description += `${bot.config.emojis.idle} **Overall Status:** Minor Outage Reported\n\n`;
                break;
            case 'none':
                description += `${bot.config.emojis.online} **Overall Status:** No Outage Reported\n\n`;
                break;
            default:
                description += `${bot.config.emojis.online} **Overall Status:** No Outage Reported\n\n`;
                break;
        }

        // Define all the components
        const components = ['api', 'cloudflare', 'media proxy', 'tax calculation service', 'push notifications', 'search', 'voice', 'third-party'];

        // Loop through the components and add them to the description
        for (const data of status.components) {
            if (components.includes(data.name.toLowerCase())) {
                switch (data.status) {
                    case 'major_outage':
                        description += `${bot.config.emojis.dnd} **${data.name}:** Major Outage\n`;
                        break;
                    case 'partial_outage':
                        description += `${bot.config.emojis.idle} **${data.name}:** Partial Outage\n`;
                        break;
                    case 'operational':
                        description += `${bot.config.emojis.online} **${data.name}:** Operational\n`;
                        break;
                    case 'degraded_performance':
                        description += `${bot.config.emojis.idle} **${data.name}:** Degraded Performance\n`;
                        break;
                    default:
                        description += `${bot.config.emojis.offline} **${data.name}:** Not reported\n`;
                        break;
                }
            }
        }

        // If there are any incidents add them to the description
        if (status.incidents.length) {
            for (const data of status.incidents) {
                incidents += stripIndents(`**Issue:** [${data.name}](https://discordstatus.com/incidents/${data.id})
                **Identified:** ${format(utcToZonedTime(parseISO(data.created_at), message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone })}
                **Status:** ${data.status.toTitleCase()}\n\n`);
            }
        }

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor({ name: `Current Status: ${status.status.description}` })
            .setColor(status.incidents.length ? 'DARK_RED' : 'GREEN')
            .setThumbnail('https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png')
            .setDescription(`${description}${incidents ? `\n\n${incidents}` : ''}`)
            .setFooter({ text: 'Fetched from https://discordstatus.com' })
            .setTimestamp();

        // Send the embed
        message.reply({ embeds: [embed] });
    },
};
