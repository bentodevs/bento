const { formatDistance, formatDuration, intervalToDuration } = require("date-fns");
const { format, utcToZonedTime } = require("date-fns-tz");
const { MessageEmbed } = require("discord.js");
const { getChannel } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "channelinfo",
        aliases: [
            "cinfo"
        ],
        usage: "channelinfo [channel]",
        examples: [
            "channelinfo #general",
            "channelinfo vc-1"
        ],
        description: "Show information about a channel.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_CHANNELS",
        type: "discord",
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
        opts: [{
            name: "channel",
            type: "CHANNEL",
            description: "Specify a channel.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        // Grab the channel
        const channel = await getChannel(message, args.join(" "), true);

        // If the user specified a invalid channel return an error!
        if (!channel)
            return message.errorReply("You didn't specify a valid channel!");

        // Define formatting for all the channel types
        const types = {
            GUILD_TEXT: {
                type: "Channel",
                icon: "https://i.imgur.com/6VyvJWL.png"
            },
            GUILD_VOICE: {
                type: "Voice Channel",
                icon: "https://i.imgur.com/yXE4Yg9.png"
            },
            GUILD_CATEGORY: {
                type: "Category",
                icon: "https://i.imgur.com/Oyl9rvi.png"
            },
            GUILD_NEWS: {
                type: "News Channel",
                icon: "https://i.imgur.com/6VyvJWL.png"
            },
            GUILD_STORE: {
                type: "Store Channel",
                icon: "https://i.imgur.com/6VyvJWL.png"
            },
            GUILD_STAGE_VOICE: {
                type: "Stage Channel",
                icon: "https://i.imgur.com/yXE4Yg9.png"
            }
        };

        // 1. Format the channel creation time
        // 2. Format the time since the channel was created
        const channelCreated = format(utcToZonedTime(channel.createdTimestamp, message.settings.general.timezone), "PPp (z)", { timeZone: message.settings.general.timezone }),
        timeSince = formatDistance(channel.createdTimestamp, Date.now(), { addSuffix: true });

        // Define the desc and lastMessage vars
        let desc = "",
        lastMessage;

        // Build the description
        desc += `**Created:** ${channelCreated} (${timeSince})\n`;
        desc += `**Position:** ${channel.position}${channel.parent ? " (in category)" : ""} | [Open Channel](https://discord.com/channels/${message.guild.id}/${channel.id})\n`;

        if (channel.children)
            desc += `**Channels:** ${channel.children.array().join(", ")}\n`;
        if (channel.parentID)
            desc += `**Category:** ${message.guild.channels.cache.get(channel.parentID).name}\n`;
        if (channel.bitrate)
            desc += `**Bitrate:** ${channel.bitrate}kbps\n`;
        if (channel.members && channel.type == "GUILD_VOICE")
            desc += `**Users Connected:** ${channel.members ? channel.members.size : 0}\n`;
        if (channel.topic)
            desc += `**Topic:** ${channel.topic !== "" ? channel.topic : "None"}\n`;
        if (channel.nsfw)
            desc += `**NSFW:** True\n`;
        if (channel.lastMessageID)
            lastMessage = await channel.messages.fetch(channel.lastMessageID).catch(() => { });
        if (channel.lastMessageID && lastMessage)
            desc += `**Last Activity:** ${formatDistance(lastMessage.createdTimestamp, Date.now(), { addSuffix: true })}`;
        if (channel.rateLimitPerUser > 0)
            desc += `\n**Rate Limit:** ${formatDuration(intervalToDuration({ start: 0, end: channel.rateLimitPerUser * 1000 }), { delimiter: ", " })}`;

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`${types[channel.type].type}: ${channel.name}`, types[channel.type].icon)
            .setDescription(desc)
            .setFooter(`ID: ${channel.id}`)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        message.reply({ embeds: [embed] });

    },

    run_interaction: async (bot, interaction) => {

        // Get the channel
        const channel = interaction.options.get("channel").channel;

        // Define formatting for all the channel types
        const types = {
            text: {
                type: "Channel",
                icon: "https://i.imgur.com/6VyvJWL.png"
            },
            voice: {
                type: "Voice Channel",
                icon: "https://i.imgur.com/yXE4Yg9.png"
            },
            category: {
                type: "Category",
                icon: "https://i.imgur.com/Oyl9rvi.png"
            },
            news: {
                type: "News Channel",
                icon: "https://i.imgur.com/6VyvJWL.png"
            },
            store: {
                type: "Store Channel",
                icon: "https://i.imgur.com/6VyvJWL.png"
            },
            stage: {
                type: "Stage Channel",
                icon: "https://i.imgur.com/yXE4Yg9.png"
            }
        };

        // 1. Format the channel creation time
        // 2. Format the time since the channel was created
        const channelCreated = format(channel.createdTimestamp, "PPp (z)"),
        timeSince = formatDistance(channel.createdTimestamp, Date.now(), { addSuffix: true });

        // Define the desc and lastMessage vars
        let desc = "",
        lastMessage;

        // Build the description
        desc += `**Created:** ${channelCreated} (${timeSince})\n`;
        desc += `**Position:** ${channel.position}${channel.parent ? " (in category)" : ""} | [Open Channel](https://discord.com/channels/${interaction.guild.id}/${channel.id})\n`;

        if (channel.children)
            desc += `**Channels:** ${channel.children.array().join(", ")}\n`;
        if (channel.parentID)
            desc += `**Category:** ${interaction.guild.channels.cache.get(channel.parentID).name}\n`;
        if (channel.bitrate)
            desc += `**Bitrate:** ${channel.bitrate}kbps\n`;
        if (channel.members && channel.type == "voice")
            desc += `**Users Connected:** ${channel.members ? channel.members.size : 0}\n`;
        if (channel.topic)
            desc += `**Topic:** ${channel.topic !== "" ? channel.topic : "None"}\n`;
        if (channel.nsfw)
            desc += `**NSFW:** True\n`;
        if (channel.lastMessageID)
            lastMessage = await channel.messages.fetch(channel.lastMessageID).catch(() => { });
        if (channel.lastMessageID && lastMessage)
            desc += `**Last Activity:** ${formatDistance(lastMessage.createdTimestamp, Date.now(), { addSuffix: true })}`;
        if (channel.rateLimitPerUser > 0)
            desc += `\n**Rate Limit:** ${formatDuration(intervalToDuration({ start: 0, end: channel.rateLimitPerUser * 1000 }), { delimiter: ", " })}`;

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`${types[channel.type].type}: ${channel.name}`, types[channel.type].icon)
            .setDescription(desc)
            .setFooter(`ID: ${channel.id}`)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        interaction.reply({ embeds: [embed] });

    }
};