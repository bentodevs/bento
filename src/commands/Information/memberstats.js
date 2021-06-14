const { stripIndents } = require("common-tags");
const { startOfToday } = require("date-fns");
const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "memberstats",
        aliases: ["mstats"],
        usage: "",
        examples: [],
        description: "Get information about the server's members",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
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
        opts: []
    },

    run: async (bot, message) => {

        // 1. Grab the amount of members that joined today
        // 2. Grab the amount of members that joined this week
        // 3. Grab all the bans
        const joinedToday = message.guild.members.cache.filter(m => m.joinedTimestamp >= startOfToday()),
        joinedWeek = message.guild.members.cache.filter(m => m.joinedTimestamp >= startOfToday(Date.now())),
        bans = await message.guild.bans.fetch();

        // Define all the ban messages
        const banMessages = {
            1: "That's not enough...",
            50: "That's a lot of bans... but not enough...",
            100: "This is starting to look more like it.",
            1000: "Do we really need this many?",
            2500: "Holy shit are you addicted to banning or something?",
            3000: "Okay its time to stop.",
            4000: "Seriously you are still going?",
            5000: "Ok I'm just going to stop checking..."
        };

        // Define the ban message
        let banMessage = banMessages[1];

        // Set the ban message based on the amount of bans
        if (bans.size >= 50) banMessage = banMessages[50];
        if (bans.size >= 100) banMessage = banMessages[100];
        if (bans.size >= 1000) banMessage = banMessages[1000];
        if (bans.size >= 2500) banMessage = banMessages[2500];
        if (bans.size >= 3000) banMessage = banMessages[3000];
        if (bans.size >= 4000) banMessage = banMessages[4000];
        if (bans.size >= 5000) banMessage = banMessages[5000];

        // Create the embed
        const embed = new MessageEmbed()
            .setAuthor(`Member Stats for ${message.guild.name}`, message.guild.iconURL({format: "png", dynamic: true}))
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setFooter(`ID: ${message.guild.id}`)
            .setTimestamp()
            .setDescription(stripIndents`🧑‍🤝‍🧑 **${message.guild.memberCount.toLocaleString()}** members | **${message.guild.members.cache.filter(m => m.presence.status !== "offline").size.toLocaleString()}** <:online:774282494593466388> Online
            📅 **${joinedToday.size}** members gained today
            🗓️ **${joinedWeek.size}** members gained this week
            <:BlobSaluteBan:852647544558452756> ${bans.size <= 0 ? "**0** bans" : `**${bans.size.toLocaleString()}**`} ${bans.size <= 0 ? "" : bans.size > 1 ? "bans" : "ban"} *(${banMessage})*`);

        // Send the embed
        message.channel.send({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {

        // 1. Grab the amount of members that joined today
        // 2. Grab the amount of members that joined this week
        // 3. Grab all the bans
        const joinedToday = interaction.guild.members.cache.filter(m => m.joinedTimestamp >= startOfToday()),
        joinedWeek = interaction.guild.members.cache.filter(m => m.joinedTimestamp >= startOfToday(Date.now())),
        bans = await interaction.guild.bans.fetch();

        // Define all the ban messages
        const banMessages = {
            1: "That's not enough...",
            50: "That's a lot of bans... but not enough...",
            100: "This is starting to look more like it.",
            1000: "Do we really need this many?",
            2500: "Holy shit are you addicted to banning or something?",
            3000: "Okay its time to stop.",
            4000: "Seriously you are still going?",
            5000: "Ok I'm just going to stop checking..."
        };

        // Define the ban message
        let banMessage = banMessages[1];

        // Set the ban message based on the amount of bans
        if (bans.size >= 50) banMessage = banMessages[50];
        if (bans.size >= 100) banMessage = banMessages[100];
        if (bans.size >= 1000) banMessage = banMessages[1000];
        if (bans.size >= 2500) banMessage = banMessages[2500];
        if (bans.size >= 3000) banMessage = banMessages[3000];
        if (bans.size >= 4000) banMessage = banMessages[4000];
        if (bans.size >= 5000) banMessage = banMessages[5000];

        // Create the embed
        const embed = new MessageEmbed()
            .setAuthor(`Member Stats for ${interaction.guild.name}`, interaction.guild.iconURL({format: "png", dynamic: true}))
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setFooter(`ID: ${interaction.guild.id}`)
            .setTimestamp()
            .setDescription(stripIndents`🧑‍🤝‍🧑 **${interaction.guild.memberCount.toLocaleString()}** members | **${interaction.guild.members.cache.filter(m => m.presence.status !== "offline").size.toLocaleString()}** <:online:774282494593466388> Online
            📅 **${joinedToday.size}** members gained today
            🗓️ **${joinedWeek.size}** members gained this week
            <:BlobSaluteBan:852647544558452756> ${bans.size <= 0 ? "**0** bans" : `**${bans.size.toLocaleString()}**`} ${bans.size <= 0 ? "" : bans.size > 1 ? "bans" : "ban"} *(${banMessage})*`);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    }
};