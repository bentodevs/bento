const { MessageEmbed } = require("discord.js");
const { default: fetch } = require("node-fetch");

module.exports = {
    info: {
        name: "imdb",
        aliases: [],
        usage: "imdb [-t] [search term]",
        examples: ["imdb The Queen's Gambit", "imdb -t tt4158110"],
        description: "Search IMDB for a show/specific title ID",
        category: "Miscellaneous",
        info: null,
        options: ["`-t` - Use as the first argument to seach for a specific title ID"]
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
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
            name: "query",
            type: "STRING",
            description: "The name of the show/movie you are searching or a specific IMDB ID.",
            required: true
        }, {
            name: "id",
            type: "BOOLEAN",
            description: "Wether or not your query is a IMDB ID.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        // Get the query, fetch the URL and convert the data to JSON
        const query = args[0].toLowerCase() == "-t" ? args[1] : args.join(" "),
        req = await fetch(`https://www.omdbapi.com/?apiKey=${bot.config.apiKeys.omdb}&${args[0].toLowerCase() == "-t" ? "i" : "t"}=${query}`),
        json = await req.json();

        // If the response isn't "True" return an error
        if (json.Response !== "True")
            return message.errorReply("A film/show could not be found with that name! Make sure your search is accurate and try again!");

        // Define the msg var
        let msg = "";

        // Add the data to the msg
        if (json.Year && json.Released) msg += `**Released:** ${json.Released}\n\n`;
        if (json.Year && !json.Released) msg += `**Release Year(s):** ${json.Year}\n\n`;
        if (json.Plot) msg += `**Plot:** ${json.Plot}\n\n`;
        if (json.imdbRating) msg += `**IMDB Rating:** ${json.imdbRating}\n`;
        if (json.Poster) msg += `**Poster Link:** [Click here](${json.Poster})\n`;
        if (json.imdbID) msg += `**IMDB Link:** [Click here](https://www.imdb.com/title/${json.imdbID}/)`;
            
        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(json.Title, (json.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setThumbnail((json.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
            .setDescription(msg)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
            
        // Send the embed
        message.reply({ embeds: [embed] });

    },
    
    run_interaction: async (bot, interaction) => {

        // Get the query, fetch the URL and convert the data to JSON
        const query = interaction.options.get("query").value,
        req = await fetch(`https://www.omdbapi.com/?apiKey=${bot.config.apiKeys.omdb}&${interaction.options.get("id").value ? "i" : "t"}=${query}`),
        json = await req.json();

        // If the response isn't "True" return an error
        if (json.Response !== "True")
            return interaction.error("A film/show could not be found with that name! Make sure your search is accurate and try again!");

        // Define the msg var
        let msg = "";

        // Add the data to the msg
        if (json.Year && json.Released) msg += `**Released:** ${json.Released}\n\n`;
        if (json.Year && !json.Released) msg += `**Release Year(s):** ${json.Year}\n\n`;
        if (json.Plot) msg += `**Plot:** ${json.Plot}\n\n`;
        if (json.imdbRating) msg += `**IMDB Rating:** ${json.imdbRating}\n`;
        if (json.Poster) msg += `**Poster Link:** [Click here](${json.Poster})\n`;
        if (json.imdbID) msg += `**IMDB Link:** [Click here](https://www.imdb.com/title/${json.imdbID}/)`;
            
        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(json.Title, (json.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setThumbnail((json.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
            .setDescription(msg)
            .setTimestamp()
            .setFooter(`Requested by ${interaction.user.tag}`);
            
        // Send the embed
        interaction.reply({ embeds: [embed] });

    }
};