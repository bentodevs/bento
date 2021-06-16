const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getWeather } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "time",
        aliases: [],
        usage: "time [location]",
        examples: [
            "time London"
        ],
        description: "Show the current time for a location.",
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
    slash: {
        enabled: true,
        opts: [{
            name: "location",
            type: "STRING",
            description: "The location you want to view the time of.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        // Special characters regex
        const specialChrs = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;

        // Check if the user used any special characters
        if (specialChrs.test(args.join(" ")))
            return message.errorReply("Please don't include any special characters in your search query!");

        // Fetch the weather from the API
        const weather = await getWeather(args.join(" "));

        // If no data was returned, return an error
        if (!weather)
            return message.errorReply("You didn't specify a valid city!");
        
        // Define the clock var
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

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Time information for ${weather.location.name} (${weather.location.country})`)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`${clock} **Local Time:** ${dt.toLocaleTimeString('en-US', { timeZone: weather.location.tz_id })}
            🗺️ **Timezone:** \`${weather.location.tz_id}\``)
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: "png" }));

        // Send the embed
        message.reply({ embeds: [embed] });

    },

    run_interaction: async (bot, interaction) => {

        // Special characters regex
        const specialChrs = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;

        // Check if the user used any special characters
        if (specialChrs.test(interaction.options.get("location").value))
            return interaction.error("Please don't include any special characters in your search query!");

        // Fetch the weather from the API
        const weather = await getWeather(interaction.options.get("location").value);

        // If no data was returned, return an error
        if (!weather)
            return interaction.error("You didn't specify a valid city!");
        
        // Define the clock var
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

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Time information for ${weather.location.name} (${weather.location.country})`)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`${clock} **Local Time:** ${dt.toLocaleTimeString('en-US', { timeZone: weather.location.tz_id })}
            🗺️ **Timezone:** \`${weather.location.tz_id}\``)
            .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true, format: "png" }));

        // Send the embed
        interaction.reply({ embeds: [embed] });

    }
};