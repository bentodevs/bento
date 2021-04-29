const { stripIndents } = require("common-tags");
const { format, formatDistance } = require("date-fns");
const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "serverinfo",
        aliases: [
            "sinfo",
            "guild",
            "ginfo",
            "guildinfo"
        ],
        usage: "",
        examples: [],
        description: "Displays information about this guild.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Create a shortcut to the guild data
        const guild = message.guild;

        // Fetch all the guild members
        await guild.members.fetch();

        // Get all the member stats
        const members = guild.memberCount.toLocaleString(),
        bots = guild.members.cache.filter(m => m.user.bot).size.toLocaleString(),
        online = guild.members.cache.filter(m => m.presence.status !== "offline").size.toLocaleString();

        // Get all the other stats
        const channels = guild.channels.cache.size,
        emotes = guild.emojis.cache.size,
        roles = guild.roles.cache.size,
        boostLevel = guild.premiumTier,
        boosters = guild.premiumSubscriptionCount;

        // Format the guild creation date
        const created = format(guild.createdTimestamp, "PPp O"),
        timeSince = formatDistance(guild.createdTimestamp, Date.now(), { addSuffix: true });

        // Security options
        const security = {
            "NONE": "None 📂",
            "LOW": "Low 🔒",
            "MEDIUM": "Medium 🔐",
            "HIGH": "(╯°□°）╯︵ ┻━┻ [High]",
            "VERY_HIGH": "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ [Phone]"
        };

        // Regions
        const region = {
            "europe": "Europe :flag_eu:",
            "eu-west": "EU (West) :flag_eu:",
            "eu-central": "EU (Central) :flag_eu:",
            "frankfurt": "Frankfurt :flag_de:",
            "london": "London :flag_gb:",
            "amsterdam": "Amsterdam :flag_nl:",
            "dubai": "Dubai :flag_ae:",
            "india": "India :flag_in:",
            "japan": "Japan :flag_jp:",
            "russia": "Russie :flag_ru:",
            "hongkong": "Hong Kong :flag_hk:",
            "brazil": "Brazil :flag_br:",
            "sydney": "Sydney :flag_au:",
            "southafrica": "South Africa :flag_za:",
            "singapore": "Singapore :flag_sg:",
            "us-south": "US (South) :flag_us:",
            "us-central": "US (Central) :flag_us:",
            "us-east": "US (East) :flag_us:",
            "us-west": "US (West) :flag_us:"
        };

        // Build embed
        const embed = new MessageEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL({ format: "png", dynamic: true }))
            .setColor(message.guild.owner.displayHexColor ? message.guild.owner.displayHexColor : "#ABCDEF")
            .setThumbnail(message.guild.iconURL({ format: "png", dynamic: true }))
            .setDescription(stripIndents`🧑‍🤝‍🧑 **${members}** ${members > 1 ? "members" : "member"} [${bots} ${(bots > 1) || (bots === 0) ? "bots" : "bot"}] | <:online:774282494593466388> **${online}** online
            📆 **Created:** ${created} (${timeSince})
            🔒 **Security:** ${security[message.guild.verificationLevel]}
            🌎 **Region:** ${region[message.guild.region]}
            <:boost_t2:699573553795956787> **Server Boost Level:** ${boostLevel} (${boosters} ${(boosters > 1) || (boosters === 0) ? "boosters" : "booster"})
            <:ceo:782583876106059799> **Owner:** ${message.guild.owner.user.tag}
            
            **Other**
            ${channels} channels | ${emotes} emotes | ${roles} roles`);
        
        // Send embed
        message.channel.send(embed);

    }
};