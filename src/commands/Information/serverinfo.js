const { stripIndents } = require("common-tags");
const { formatDistance } = require("date-fns");
const { format, utcToZonedTime } = require("date-fns-tz");
const { MessageEmbed } = require("discord.js");
const config = require("../../config");

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
        premium: false,
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: []
    },

    run: async (bot, message) => {

        // Create a shortcut to the guild data
        const guild = message.guild;

        // Fetch all the guild members
        await guild.members.fetch();

        // Get all the member stats
        const members = guild.memberCount.toLocaleString(),
        bots = guild.members.cache.filter(m => m.user.bot).size.toLocaleString(),
        online = guild.members.cache.filter(m => m.presence?.status && m.presence?.status !== "offline").size.toLocaleString();

        // Get all the other stats
        const channels = guild.channels.cache.size,
        emotes = guild.emojis.cache.size,
        roles = guild.roles.cache.size,
        boostLevel = guild.premiumTier,
        boosters = guild.premiumSubscriptionCount;

        // Format the guild creation date
        const created = format(utcToZonedTime(guild.createdTimestamp, message.settings.general.timezone), "PPp (z)"),
        timeSince = formatDistance(guild.createdTimestamp, Date.now(), { addSuffix: true });

        // Fetch the guild owner
        const owner = await guild.fetchOwner();

        // Security options
        const security = {
            "NONE": "None 📂",
            "LOW": "Low 🔒",
            "MEDIUM": "Medium 🔐",
            "HIGH": "(╯°□°）╯︵ ┻━┻ [High]",
            "VERY_HIGH": "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ [Phone]"
        };

        // Build embed
        const embed = new MessageEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL({ format: "png", dynamic: true }))
            .setColor(owner.displayColor ?? bot.config.general.embedColor)
            .setThumbnail(message.guild.iconURL({ format: "png", dynamic: true }))
            .setDescription(stripIndents`🧑‍🤝‍🧑 **${members}** ${members > 1 ? "members" : "member"} [${bots} ${(bots > 1) || (bots === 0) ? "bots" : "bot"}] | ${config.emojis.online} **${online}** online
            📆 **Created:** ${created} (${timeSince})
            🔒 **Security:** ${security[message.guild.verificationLevel]}
            ${config.emojis.nitro} **Server Boost Level:** ${boostLevel} (${boosters} ${(boosters > 1) || (boosters === 0) ? "boosters" : "booster"})
            ${config.emojis.ceo} **Owner:** ${owner.user.tag}
            
            **Other**
            ${channels} channels | ${emotes} emotes | ${roles} roles`);
        
        // Send embed
        message.reply({ embeds: [embed] });

    }
};