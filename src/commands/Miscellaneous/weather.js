const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getWeather } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "weather",
        aliases: [],
        usage: "weather <city>",
        examples: [
            "weather Amsterdam",
            "weather London"
        ],
        description: "Displays the current weather in a specific location.",
        category: "Miscellaneous",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Special characters regex
        const specialChrs = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;

        // Check if the user used any special characters
        if (specialChrs.test(args.join(" ")))
            return message.error("Please don't include any special characters in your search query!");

        // Fetch the weather from the API
        const weather = await getWeather(args.join(" "));

        // If no data was returned, return an error
        if (!weather)
            return message.error("You didn't specify a valid city!");

        // Get the wind directions
        const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"],
        index = Math.round(((weather.current.wind_degree %= 360) < 0 ? weather.current.wind_degree + 360 : weather.current.wind_degree) / 45) % 8;

        // Build the embed
        const embed = new MessageEmbed()
            .setTitle(`Weather for ${weather.location.name}, ${weather.location.country}`)
            .setThumbnail(`https:${weather.current.condition.icon}`)
            .setDescription(stripIndents`**Weather:** ${weather.current.condition.text}
            **Temperature:** ${weather.current.temp_c}°C / ${weather.current.temp_f}°F
            **Feels Like:** ${weather.current.feelslike_c}°C / ${weather.current.feelslike_f}°F
            **Humidity:** ${weather.current.humidity}%
            **Wind:** ${weather.current.wind_kph} km/h / ${weather.current.wind_mph} mi/h ${directions[index]}
            **Visibility:** ${weather.current.vis_km} km / ${weather.current.vis_miles} miles
            **Clouds:** ${weather.current.cloud}%`)
            .setFooter("Last Updated")
            .setTimestamp(weather.current.last_updated_epoch * 1000)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        message.channel.send(embed);

    }
};