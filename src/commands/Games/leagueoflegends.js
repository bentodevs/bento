const { stripIndents } = require("common-tags");
const { format } = require("date-fns");
const { MessageEmbed } = require("discord.js");
const { getLeagueSummoner, getLeagueChampByID } = require("../../modules/functions/riotgames");

module.exports = {
    info: {
        name: "leagueoflegends",
        aliases: ["lol"],
        usage: "leagueoflegends <region> <summoner>",
        examples: ["leagueoflegends na WaitroseNA"],
        description: "Get information about a League of Legends summoner",
        category: "Games",
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
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // If no summoner was provided, then throw an error
        if (!args[1])
            return message.error("You didn't provide any summoner name!");
        
        // Send a loading message & assign it to msg
        const msg = await message.loading(`Fetching the League of Legends profile for \`${args.splice(1).join("")}\``);
        
        // Fetch the league summoner data
        const data = await getLeagueSummoner(args[0], args.splice(1).join());

        // Catch any errors
        if (data === "NO_REGION")
            return msg.edit(`${bot.config.emojis.error} It looks like you entered an incorrect region!`);
        
        if (data === "NO_USER_FOUND")
            return msg.edit(`${bot.config.emojis.error} It looks like there isn't a Summoner with that name!`);

        // Sort the matches by time
        const matchList = data.matchData.matches.sort((a, b) => b.timestamp - a.timestamp);

        // Set the recent matches string
        let matches = "**Recent Matches**\n";
       
        // For the 5 most recent matches in a player's history, fetch the data and add
        // to the recent matches string
        for await (const m of matchList.slice(0, 5)) {
            const champ = await getLeagueChampByID(m.champion);

            matches += `**Played:** ${format(m.timestamp, "Pp")} | **Lane:** ${m.lane.toTitleCase()} | **Champ:** ${champ.name}\n`;
        }

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`League of Legends data for ${data.user}`, `https://ddragon.leagueoflegends.com/cdn/11.9.1/img/profileicon/${data.profileIconId}.png`)
            .setColor((message.member.displayHexColor ?? bot.config.general.embedColor))
            .setDescription(stripIndents`**Summoner Name:** ${data.user}
            **Summoner Level:** ${data.summonerLevel}
            **Games Played:** ${data.matchData.totalGames}
            
            ${matches}`)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: "png" }));
        
        // Delete the loading message
        msg.delete().catch(() => { });
        // Send the embed
        message.channel.send(embed);
    }
};