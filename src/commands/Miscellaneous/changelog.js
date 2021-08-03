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
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        if (!message.settings.changelogs.channel)
            return message.errorReply("There is no Changelog channel currently set!");

        if (!message.guild.channels.cache.has(message.settings.changelogs.channel) || !message.guild.channels.fetch(message.settings.changelogs.channel)) {
            await settings.findOneAndUpdate({ _id: message.guild.id }, { "changelogs.channel": null });
            return message.errorReply("The Changelog channel was unset as the channel no longer exists!");
        }

        if (!message.settings.changelogs?.locations.length)
            return message.errorReply("There are no Changelog locations set!");

        if (!message.settings.changelogs?.locations.includes(args[0]))
            return message.errorReply(`You didn't specify a valid Changelog location! Valid locations are: \`${message.settings.changelogs.locations.join("`, `")}\``);

        const items = args.slice(1).join(" ").split("|"),
            changelogEntries = [];

        for (const data of items) {
            changelogEntries.push(`:small_blue_diamond: ${data.trim()}`);
        }

        const embed = new MessageEmbed()
            .setTitle(`${args[0].toTitleCase()} Changelog`)
            .setColor("#2E93FF")
            .setDescription(stripIndents`${changelogEntries.join("\n")}`)
            .setTimestamp()
            .setFooter(`Submitted by ${message.author.tag}`, message.author.displayAvatarURL({ format: "png", dynamic: true }));

        await message.guild.channels.cache.get(message.settings.changelogs.channel).send({ embeds: [embed] })
            .then(() => message.confirmationReply("The Changelog was submitted successfully!"))
            .catch(err => message.errorReply(`There was an error sending the Changelog! \`${err.message}\``));
    }
};