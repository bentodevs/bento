const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getLeagueChampByName } = require("../../modules/functions/riotgames");

module.exports = {
    info: {
        name: "championinfo",
        aliases: ["champinfo"],
        usage: "championinfo <Champion name>",
        examples: ["championinfo Rakan"],
        description: "Search for information about a League of Legends champion!",
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

        // Fetch the champ
        const champ = await getLeagueChampByName(args.join(""));

        // Catch any errors
        if (champ === "NO_CHAMP_FOUND")
            return message.error("It looks like you didn't provide a valid Champion!");

        // Build the embed
        const embed = new MessageEmbed()
            .setTitle(`${champ.name}, ${champ.title}`)
            .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/11.9.1/img/champion/${champ.id}.png`)
            .setColor((message.member.displayHexColor ?? bot.config.general.embedColor))
            .setDescription(stripIndents`${champ.blurb}
            
            **Tags:** \`${champ.tags.join("`, `")}\`

            **__Base Stats:__**
            **Health:** ${champ.stats.hp} (+${champ.stats.hpperlevel} per level)
            **Mana:** ${champ.stats.mp} (+${champ.stats.mpperlevel} per level)
            **Armor:** ${champ.stats.armor} (+${champ.stats.armorperlevel} per level)
            **Attack Damage:** ${champ.stats.attackdamage} (+${champ.stats.attackdamage} per level)`)
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
            .setTimestamp();
        
        // Send the embed
        message.channel.send(embed);

    }
};