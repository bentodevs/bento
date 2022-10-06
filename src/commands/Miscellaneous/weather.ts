import { stripIndents } from 'common-tags';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import { getWeather } from '../../modules/functions/misc';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../data/constants';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'weather',
        usage: 'weather <city>',
        examples: [
            'weather Amsterdam',
            'weather London',
        ],
        description: 'Displays the current weather in a specific location.',
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
        opts: [{
            name: 'city',
            type: ApplicationCommandOptionType.String,
            description: 'The city you want to view the weather of.',
            required: true,
            maxLength: 128,
        }],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Special characters regex
        const specialChrs = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;
        const city = interaction.options.getString('city', true);

        // Check if the user used any special characters
        if (specialChrs.test(city)) return InteractionResponseUtils.error(interaction, "Please don't include any special characters in your search query!", true);

        // Fetch the weather from the API
        const weather = await getWeather(city);

        // If no data was returned, return an error
        if (!weather) return InteractionResponseUtils.error(interaction, "You didn't specify a valid city!", true);

        // Get the wind directions
        const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
        // eslint-disable-next-line no-cond-assign
        const index = Math.round(((weather.current.wind_degree %= 360) < 0 ? weather.current.wind_degree + 360 : weather.current.wind_degree) / 45) % 8;

        // Build the embed
        const embed = new EmbedBuilder()
            .setTitle(`Weather for ${weather.location.name}, ${weather.location.country}`)
            .setThumbnail(`https:${weather.current.condition.icon}`)
            .setDescription(stripIndents`**Weather:** ${weather.current.condition.text}
            **Temperature:** ${weather.current.temp_c}°C / ${weather.current.temp_f}°F
            **Feels Like:** ${weather.current.feelslike_c}°C / ${weather.current.feelslike_f}°F
            **Humidity:** ${weather.current.humidity}%
            **Wind:** ${weather.current.wind_kph} km/h / ${weather.current.wind_mph} mi/h ${directions[index]}
            **Visibility:** ${weather.current.vis_km} km / ${weather.current.vis_miles} miles
            **Clouds:** ${weather.current.cloud}%`)
            .setFooter({ text: 'Last Updated' })
            .setTimestamp(weather.current.last_updated_epoch * 1000)
            .setColor((interaction.member as GuildMember)?.displayColor ?? DEFAULT_COLOR);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
