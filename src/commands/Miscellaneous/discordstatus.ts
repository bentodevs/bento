import { stripIndents } from 'common-tags';
import { parseISO, format } from 'date-fns';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getDiscordStatus } from '../../modules/functions/misc';
import { Command } from '../../modules/interfaces/cmd';
import emojis from '../../data/emotes';
import { StringUtils } from '../../utils/StringUtils';

const command: Command = {
    info: {
        name: 'discordstatus',
        usage: '',
        examples: [],
        description: "Get Discord's current status.",
        category: 'Miscellaneous',
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
        opts: [],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, interaction) => {
        await interaction.deferReply();
        // Get the current Discord Status
        const status = await getDiscordStatus();

        // Define the description and incident vars
        let description = `**Last Update:** ${format(parseISO(status.page.updated_at), 'PPp O')}\n\n`;
        let incidents;

        // Add the overall status to the description
        switch (status.status.indicator) {
            case 'major':
                description += `${emojis.dnd} **Overall Status:** Major Outage Reported\n\n`;
                break;
            case 'minor':
                description += `${emojis.idle} **Overall Status:** Minor Outage Reported\n\n`;
                break;
            case 'none':
                description += `${emojis.online} **Overall Status:** No Outage Reported\n\n`;
                break;
            default:
                description += `${emojis.online} **Overall Status:** No Outage Reported\n\n`;
                break;
        }

        // Define all the components
        const components = ['api', 'cloudflare', 'media proxy', 'tax calculation service', 'push notifications', 'search', 'voice', 'third-party'];

        // Loop through the components and add them to the description
        for (const data of status.components) {
            if (components.includes(data.name.toLowerCase())) {
                switch (data.status) {
                    case 'major_outage':
                        description += `${emojis.dnd} **${data.name}:** Major Outage\n`;
                        break;
                    case 'partial_outage':
                        description += `${emojis.idle} **${data.name}:** Partial Outage\n`;
                        break;
                    case 'operational':
                        description += `${emojis.online} **${data.name}:** Operational\n`;
                        break;
                    case 'degraded_performance':
                        description += `${emojis.idle} **${data.name}:** Degraded Performance\n`;
                        break;
                    default:
                        description += `${emojis.offline} **${data.name}:** Not reported\n`;
                        break;
                }
            }
        }

        // If there are any incidents add them to the description
        if (status.incidents.length) {
            for (const data of status.incidents) {
                incidents += stripIndents(`**Issue:** [${data.name}](https://discordstatus.com/incidents/${data.id})
                **Identified:** <t:${parseFloat((Date.parse(data.created_at) / 1000).toString())}:R>
                **Status:** ${StringUtils.toTitleCase(data.status)}\n\n`);
            }
        }

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Current Status: ${status.status.description}` })
            .setColor(status.incidents.length ? 'DarkRed' : 'Green')
            .setThumbnail('https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png')
            .setDescription(`${description}${incidents ? `\n\n${incidents}` : ''}`)
            .setFooter({ text: 'Fetched from https://discordstatus.com' })
            .setTimestamp();

        // Send the embed
        interaction.editReply({ embeds: [embed] });
    },
};

export default command;
