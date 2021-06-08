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

    run: async (bot, message, args) => {

        if (args[0].toLowerCase() === "-t") {

            const url = args[1],
            req = await fetch(`https://www.omdbapi.com/?apiKey=${bot.config.apiKeys.omdb}&i=${url}`),
            res = await req.json();
        
            if (res.Response !== "True")
                return message.error("A film/show could not be found with that name! Make sure your search is accurate and try again!");
            
            let msg = "";
            if (res.Year && res.Released) msg += `**Released:** ${res.Released}\n\n`;
            if (res.Year && !res.Released) msg += `**Release Year(s):** ${res.Year}\n\n`;
            if (res.Plot) msg += `**Plot:** ${res.Plot}\n\n`;
            if (res.imdbRating) msg += `**IMDB Rating:** ${res.imdbRating}\n`;
            if (res.Poster) msg += `**Poster Link:** [Click here](${res.Poster})\n`;
            if (res.imdbID) msg += `**IMDB Link:** [Click here](https://www.imdb.com/title/${res.imdbID}/)`;
            
            const embed = new MessageEmbed()
                .setAuthor(res.Title, (res.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setThumbnail((res.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
                .setDescription(msg)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`);
            
            message.channel.send(embed);
        } else {
            const url = args.join(),
                req = await fetch(`https://www.omdbapi.com/?apiKey=19b7aea0&t=${url}`),
                res = await req.json();
            
            if (res.Response !== "True")
                return message.error("A film/show could not be found with that name! Make sure your search is accurate and try again!");
            
            let msg = "";
            if (res.Year && res.Released) msg += `**Released:** ${res.Released}\n\n`;
            if (res.Year && !res.Released) msg += `**Release Year(s):** ${res.Year}\n\n`;
            if (res.Plot) msg += `**Plot:** ${res.Plot}\n\n`;
            if (res.imdbRating) msg += `**IMDB Rating:** ${res.imdbRating}\n`;
            if (res.Poster) msg += `**Poster Link:** [Click here](${res.Poster})\n`;
            if (res.imdbID) msg += `**IMDB Link:** [Click here](https://www.imdb.com/title/${res.imdbID}/)`;
            
            const embed = new MessageEmbed()
                .setAuthor(res.Title, (res.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setThumbnail((res.Poster ?? "https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png"))
                .setDescription(msg)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`);
            
            message.channel.send(embed);
        }
    }
};