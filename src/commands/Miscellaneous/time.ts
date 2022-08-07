import { stripIndents } from 'common-tags';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import { getWeather } from '../../modules/functions/misc.js';
import { DEFAULT_COLOR } from '../../modules/structures/constants.js';
import { InteractionResponseUtils } from '../../modules/utils/TextUtils.js';

export default {
    info: {
        name: 'time',
        usage: 'time [location]',
        examples: [
            'time London',
        ],
        description: 'Show the current time for a location.',
        category: 'Miscellaneous',
        info: null,
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
        ],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: [],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        opts: [{
            name: 'location',
            type: ApplicationCommandOptionType.String,
            description: 'The location you want to view the time of.',
            required: true,
            maxLength: 128,
        }],
        defaultPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const specialChrs = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;
        const location = interaction.options.getString('location', true);

        // Check if the user used any special characters
        if (specialChrs.test(location)) return InteractionResponseUtils.error(interaction, "Please don't include any special characters in your search query!", true);

        // Fetch the weather from the API
        const weather = await getWeather(location);

        // If no data was returned, return an error
        if (!weather) return InteractionResponseUtils.error(interaction, "You didn't specify a valid city!", true);

        // Define the clock var
        let clock = '';

        const dt = new Date(Date.now());
        const clockHour = dt.toLocaleTimeString('en-US', { timeZone: weather.location.tz_id }).split(':');

        // Switch-case for adding the correct clock emoji
        switch (clockHour[0]) {
            case '1': clock = '🕐'; break;
            case '2': clock = '🕑'; break;
            case '3': clock = '🕒'; break;
            case '4': clock = '🕓'; break;
            case '5': clock = '🕔'; break;
            case '6': clock = '🕕'; break;
            case '7': clock = '🕖'; break;
            case '8': clock = '🕗'; break;
            case '9': clock = '🕘'; break;
            case '10': clock = '🕙'; break;
            case '11': clock = '🕚'; break;
            case '12': clock = '🕛'; break;
            default: clock = '🕐'; break;
        }

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Time information for ${weather.location.name} (${weather.location.country})` })
            .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
            .setDescription(stripIndents`${clock} **Local Time:** ${dt.toLocaleTimeString('en-US', { timeZone: weather.location.tz_id })}
            🗺️ **Timezone:** \`${weather.location.tz_id}\``)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user?.displayAvatarURL() });

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};
