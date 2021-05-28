const { stripIndents } = require("common-tags");
const { format, parse } = require("date-fns");
const { getTimezoneOffset } = require("date-fns-tz");
const { MessageEmbed } = require("discord.js");
const { getWeather, getTime } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "time",
        aliases: [],
        usage: "time [location]",
        examples: [
            "time London"
        ],
        description: "Show the current time for a location",
        category: "Miscellaneous",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
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
        
        let clock = "";

        const dt = new Date(Date.now()),
            clockHour = dt.toLocaleTimeString('en-US', { timeZone: weather.location.tz_id }).split(":");
        
        // Switch-case for adding the correct clock emoji
        switch (clockHour[0]) {
            case "1": clock = "🕐"; break;
            case "2": clock = "🕑"; break;
            case "3": clock = "🕒"; break;
            case "4": clock = "🕓"; break;
            case "5": clock = "🕔"; break;
            case "6": clock = "🕕"; break;
            case "7": clock = "🕖"; break;
            case "8": clock = "🕗"; break;
            case "9": clock = "🕘"; break;
            case "10": clock = "🕙"; break;
            case "11": clock = "🕚"; break;
            case "12": clock = "🕛"; break;
        }

        const embed = new MessageEmbed()
            .setAuthor(`Time information for ${weather.location.name} (${weather.location.country})`)
            .setColor(message.member.displayHexColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`${clock} **Local Time:** ${dt.toLocaleTimeString('en-US', { timeZone: weather.location.tz_id })}
            🗺️ **Timezone:** \`${weather.location.tz_id}\``)
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: "png" }));

        message.channel.send(embed);
    }
};