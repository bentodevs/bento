const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const settings = require("../../database/models/settings");

module.exports = {
    info: {
        name: "changelog",
        aliases: [
            "clog"
        ],
        usage: "changelog <location> <item 1 | item 2 | ...>",
        examples: [
            "changelog discord Fixed this | Fixed that"
        ],
        description: "Submit a changelog to the Changelog channel",
        category: "Miscellaneous",
        info: "You must split each Changelog item with \"|\"",
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
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
            description: "The area that these changes affect.",
            required: true
        }, {
            name: "changes",
            type: "STRING",
            description: "The changes made - Each item should be separated using |.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        //  If there is no changelog channel, then return error
        if (!message.settings.changelogs.channel)
            return message.errorReply("There is no Changelog channel currently set!");

        // If the changelog channel no longer exists, then unset in Mongo and return an error
        if (!message.guild.channels.cache.has(message.settings.changelogs.channel) || !message.guild.channels.fetch(message.settings.changelogs.channel)) {
            await settings.findOneAndUpdate({ _id: message.guild.id }, { "changelogs.channel": null });
            return message.errorReply("The Changelog channel was unset as the channel no longer exists!");
        }

        // If there are no changelog locations, then return an error
        if (!message.settings.changelogs?.locations.length)
            return message.errorReply("There are no Changelog locations set!");

        // If the changelog locations don't include the specified option, then return an error
        if (!message.settings.changelogs?.locations.includes(args[0]))
            return message.errorReply(`You didn't specify a valid Changelog location! Valid locations are: \`${message.settings.changelogs.locations.join("`, `")}\``);

        // 1. Get all the items and split them by the "|" char
        // 2. Create an empty array for the formatted changelog items
        const items = args.slice(1).join(" ").split("|"),
            changelogEntries = [];

        // Format the array
        for (const data of items) {
            changelogEntries.push(`:small_blue_diamond: ${data.trim()}`);
        }

        // Buold the embed
        const embed = new MessageEmbed()
            .setTitle(`${args[0].toTitleCase()} Changelog`)
            .setColor("#2E93FF")
            .setDescription(stripIndents`${changelogEntries.join("\n")}`)
            .setTimestamp()
            .setFooter(`Submitted by ${message.author.tag}`, message.author.displayAvatarURL({ format: "png", dynamic: true }));

        // Send the embed to the changelog channel
        // If it sends fine, then return a confirmation message, else we catch the error and send an error to the user
        await message.guild.channels.cache.get(message.settings.changelogs.channel).send({ embeds: [embed] })
            .then(() => message.confirmationReply("The Changelog was submitted successfully!"))
            .catch(err => message.errorReply(`There was an error sending the Changelog! \`${err.message}\``));
    },

    run_interaction: async (bot, interaction) => {

        // 1. Get the location option
        // 2. Get the changelog items
        const location = interaction.options.get("location").value,
            items = interaction.options.get("changes").value;

        // If there is no changelog channel, then return error
        if (!interaction.settings.changelogs.channel)
            return interaction.error({ content: "There is no changelog channel configured!", ephemeral: true });

        if (!interaction.guild.channels.cache.has(interaction.settings.changelogs.channel) || !interaction.guild.channels.fetch(interaction.settings.changelogs.channel)) {
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "changelogs.channel": null });
            return interaction.error({ content: "The Changelog channel was unset as the channel no longer exists!", ephemeral: true });
        }

        // If there are no changelog locations, then return an error
        if (!interaction.settings.changelogs?.locations.length)
            return interaction.error({ content: "There are no Changelog locations set!", ephemeral: true });

        // If the changelog locations don't include the specified option, then return an error
        if (!interaction.settings.changelogs?.locations.includes(location.toLowerCase()))
            return interaction.error({ content: `You didn't specify a valid Changelog location! Valid locations are: \`${interaction.settings.changelogs.locations.join("`, `")}\``, ephemeral: true });

        // 1. Get all the items and split them by the "|" char
        // 2. Create an empty array for the formatted changelog items
        const changelogEntries = [];

        // Format the array
        for (const data of items.split("|")) {
            changelogEntries.push(`:small_blue_diamond: ${data.trim()}`);
        }

        // Buold the embed
        const embed = new MessageEmbed()
            .setTitle(`${location.toTitleCase()} Changelog`)
            .setColor("#2E93FF")
            .setDescription(stripIndents`${changelogEntries.join("\n")}`)
            .setTimestamp()
            .setFooter(`Submitted by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ format: "png", dynamic: true }));

        // Send the embed to the changelog channel
        // If it sends fine, then return a confirmation message, else we catch the error and send an error to the user
        await interaction.guild.channels.cache.get(interaction.settings.changelogs.channel).send({ embeds: [embed] })
            .then(() => interaction.confirmation({ content: "The Changelog was submitted successfully!", ephemeral: true }))
            .catch(err => interaction.error({ content: `There was an error sending the Changelog! \`${err.message}\``, ephemeral: true }));
    }
};