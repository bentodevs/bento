const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const config = require("../../config");
const settings = require("../../database/models/settings");

module.exports = {
    info: {
        name: "automod",
        aliases: [],
        usage: "automod [option] [value]",
        examples: [
            "automod no-invite disable",
            "automod mentions-ban 10",
            "automod filter enable"
        ],
        description: "Change automod settings",
        category: "Settings",
        info: null,
        options: [
            "`filter` - Enable or disable the filter",
            "`zalgo` - Enable or disable the ability to send [Zalgo Text](https://en.wikipedia.org/wiki/Zalgo_text)",
            "`no-invite` - Enable or disable the ability to send other guild invites",
            "`no-link` - Enable or disable the ability to send links",
            "`mentions-mute` - Set the maximum amount of users that can be mentioned before the sender is muted (Use \"off\" or \"0\" to disable)",
            "`mentions-ban` - Set the maximum amount of users that can be mentioned before the sender is banned (Use \"off\" or \"0\" to disable)"
        ]
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
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "view",
            type: "SUB_COMMAND",
            description: "View the automod settings."
        }, {
            name: "filter",
            type: "SUB_COMMAND",
            description: "Enable or disable the filter.",
            options: [{
                name: "toggle",
                type: "BOOLEAN",
                description: "Set to true to enable the filter, set to false to disable the filter.",
                required: true
            }]
        }, {
            name: "zalgo",
            type: "SUB_COMMAND",
            description: "Enable or disable the ability to send Zalgo Text.",
            options: [{
                name: "toggle",
                type: "BOOLEAN",
                description: "Set to true to enable the Zalgo filter, set to false to disable Zalgo filter.",
                required: true
            }]
        }, {
            name: "no-invite",
            type: "SUB_COMMAND",
            description: "Enable or disable the ability to send other guild invites.",
            options: [{
                name: "toggle",
                type: "BOOLEAN",
                description: "Set to true to enable the invite filter, set to false to disable the invite filter.",
                required: true
            }]
        }, {
            name: "no-link",
            type: "SUB_COMMAND",
            description: "Enable or disable the ability to send links.",
            options: [{
                name: "toggle",
                type: "BOOLEAN",
                description: "Set to true to enable the URL filter, set to false to disable the URL filter.",
                required: true
            }]
        }, {
            name: "mentions-mute",
            type: "SUB_COMMAND",
            description: "Set the max amount of users that can be mentioned before the sender is muted (Use \"0\" to disable)",
            options: [{
                name: "amount",
                type: "INTEGER",
                description: "The max amount of users that can be mentioned before the user gets muted.",
                required: true
            }]
        }, {
            name: "mentions-ban",
            type: "SUB_COMMAND",
            description: "Set the max amount of users that can be mentioned before the sender is banned (Use \"0\" to disable)",
            options: [{
                name: "amount",
                type: "INTEGER",
                description: "The max amount of users that can be mentioned before the user gets banned.",
                required: true
            }]
        }]
    },

    run: async (bot, message, args) => {

        const options = ["enable", "disable"];

        if (!args[0]) {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Auto-mod settings for ${message.guild.name}`, message.guild.iconURL({ format: "png", dynamic: true }))
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setDescription(stripIndents`🧮 Message filtering is currently ${message.settings.moderation.filter?.state ? "**enabled**" : "**disabled**"}
                ⌨️ Using [Zalgo Text](https://en.wikipedia.org/wiki/Zalgo_text) is currently ${message.settings.moderation.filter?.zalgo ? "**disallowed**" : "**allowed**"}
                🖇️ Invite posting is currently ${message.settings.moderation.no_invite ? "**disallowed**" : "**allowed**"}
                🌐 Link posting is currently ${message.settings.moderation.no_link ? "**disallowed**" : "**allowed**"}

                🔇 The number of allowed mentions before being muted is ${message.settings.moderation.mentions_mute || "**not set**"}
                ${config.emojis.pepe_ping} The number of allowed mentions before being banned is ${message.settings.moderation.mentions_ban || "**not set**"}`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ format: "png", dynamic: true }));

            // Send embed
            message.reply({ embeds: [embed] });
        } else if (args[0].toLowerCase() === "filter") {
            if (args[1].toLowerCase() === "enable") {
                // Enable filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.state": true });
                return message.confirmationReply("Message filtering has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.state": false });
                return message.confirmationReply("Message filtering has been **disabled**");
            } else {
                return message.errorReply(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        } else if (args[0].toLowerCase() === "zalgo") {
            if (args[1].toLowerCase() === "enable") {
                // Enable zalgo filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.zalgo": true });
                return message.confirmationReply("Zalgo text moderation has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.filter.zalgo": false });
                return message.confirmationReply("Zalgo text moderation has been **disabled**");
            } else {
                return message.errorReply(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        } else if (args[0].toLowerCase() === "no-invite") {
            if (args[1].toLowerCase() === "enable") {
                // Enable invite filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_invite": true });
                message.confirmationReply("Invite filtering has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_invite": false });
                message.confirmationReply("Invite filtering has been **disabled**");
            } else {
                return message.errorReply(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        } else if (args[0].toLowerCase() === "no-link") {
            if (args[1].toLowerCase() === "enable") {
                // Enable link filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_link": true });
                message.confirmationReply("Link filtering has been **enabled**");
            } else if (args[1].toLowerCase() === "disable") {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.no_link": false });
                message.confirmationReply("Link filtering has been **disabled**");
            } else {
                return message.errorReply(`You did not specify a valid option! Valid options are \`${options.join("`, `")}\``);
            }
        } else if (args[0].toLowerCase() === "mentions-mute") {
            if ((args[1].toLowerCase() === "off") || (args[1].toLowerCase() === "0")) {
                // If the max mentions is unset already, return an error
                if (!message.settings.moderation.mentions_mute)
                    return message.errorReply("There is no mute threshold for message mentions currently set!");

                // Disable max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.mentions_mute": null })
                    .then(() => message.confirmationReply(`The mute threshold for message mentions has been disabled`))
                    .catch(err => message.errorReply(`There was an error whilst disabling the mute threshold: ${err.message}`));
            } else if (!isNaN(args[1])) {
                // If the amount specified is larger than the mentions_ban setting return an error
                if (message.settings.moderation.mentions_ban && args[1] > message.settings.moderation.mentions_ban)
                    return message.errorReply("Te mentions-mute amount needs to be lower than the mentions-ban setting!");

                // Set max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.mentions_mute": args[1] })
                    .then(() => message.confirmationReply(`The mute threshold for message mentions has been set to \`${args[1]}\``))
                    .catch(err => message.errorReply(`There was an error whilst setting the mute threshold: ${err.message}`));
            } else {
                // If there was no valid number, or the settings isn't "off" - return an error
                return message.errorReply("You did not specify a valid value!");
            }
        } else if (args[0].toLowerCase() === "mentions-ban") {
            if ((args[1].toLowerCase() === "off") || (args[1].toLowerCase() === "0")) {
                // If the max mentions is unset already, return an error
                if (!message.settings.moderation.mentions_ban)
                    return message.errorReply("There is no ban threshold for message mentions currently set!");

                // Disable max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.mentions_ban": null })
                    .then(() => message.confirmationReply(`The ban threshold for message mentions has been disabled`))
                    .catch(err => message.errorReply(`There was an error whilst disabling the ban threshold: ${err.message}`));
            } else if (!isNaN(args[1])) {
                // If the amount specified is smaller than the mentions_mute setting return an error
                if (message.settings.moderation.mentions_mute && args[1] < message.settings.moderation.mentions_mute)
                    return message.errorReply("Te mentions-ban amount needs to be higher than the mentions-mute setting!");

                // Set max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: message.guild.id }, { "moderation.mentions_ban": args[1] })
                    .then(() => message.confirmationReply(`The ban threshold for message mentions has been set to \`${args[1]}\``))
                    .catch(err => message.errorReply(`There was an error whilst setting the ban threshold: ${err.message}`));
            } else {
                // If there was no valid number, or the settings isn't "off" - return an error
                return message.errorReply("You did not specify a valid value!");
            }
        } else {
            return message.errorReply("You did not specify a valid option!");
        }

    },

    run_interaction: async (bot, interaction) => {

        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub == "view") {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Auto-mod settings for ${interaction.guild.name}`, interaction.guild.iconURL({ format: "png", dynamic: true }))
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(stripIndents`🧮 Message filtering is currently ${interaction.settings.moderation.filter?.state ? "**enabled**" : "**disabled**"}
                ⌨️ Using [Zalgo Text](https://en.wikipedia.org/wiki/Zalgo_text) is currently ${interaction.settings.moderation.filter?.zalgo ? "**disallowed**" : "**allowed**"}
                🖇️ Invite posting is currently ${interaction.settings.moderation.no_invite ? "**disallowed**" : "**allowed**"}
                🌐 Link posting is currently ${interaction.settings.moderation.no_link ? "**disallowed**" : "**allowed**"}

                🔇 The number of allowed mentions before being muted is ${interaction.settings.moderation.mentions_mute || "**not set**"}
                ${config.emojis.pepe_ping} The number of allowed mentions before being banned is ${interaction.settings.moderation.mentions_ban || "**not set**"}`)
                .setTimestamp()
                .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ format: "png", dynamic: true }));

            // Send embed
            interaction.reply({ embeds: [embed] });
        } else if (sub == "filter") {
            if (interaction.options.get("toggle").value) {
                // Enable filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.filter.state": true });
                return interaction.confirmation("Message filtering has been **enabled**");
            } else if (!interaction.options.get("toggle").value) {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.filter.state": false });
                return interaction.confirmation("Message filtering has been **disabled**");
            }
        } else if (sub == "zalgo") {
            if (interaction.options.get("toggle").value) {
                // Enable zalgo filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.filter.zalgo": true });
                return interaction.confirmation("Zalgo text moderation has been **enabled**");
            } else if (!interaction.options.get("toggle").value) {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.filter.zalgo": false });
                return interaction.confirmation("Zalgo text moderation has been **disabled**");
            }
        } else if (sub == "no-invite") {
            if (interaction.options.get("toggle").value) {
                // Enable invite filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.no_invite": true });
                interaction.confirmation("Invite filtering has been **enabled**");
            } else if (!interaction.options.get("toggle").value) {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.no_invite": false });
                interaction.confirmation("Invite filtering has been **disabled**");
            }
        } else if (sub == "no-link") {
            if (interaction.options.get("toggle").value) {
                // Enable link filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.no_link": true });
                interaction.confirmation("Link filtering has been **enabled**");
            } else if (!interaction.options.get("toggle").value) {
                // Disable filter & send confirmation
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.no_link": false });
                interaction.confirmation("Link filtering has been **disabled**");
            }
        } else if (sub == "mentions-mute") {
            if (interaction.options.get("amount").value === 0) {
                // If the max mentions is unset already, return an error
                if (!interaction.settings.moderation.mentions_mute)
                    return interaction.error("There is no mute threshold for message mentions currently set!");

                // Disable max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.mentions_mute": null })
                    .then(() => interaction.confirmation(`The mute threshold for message mentions has been disabled`))
                    .catch(err => interaction.error(`There was an error whilst disabling the mute threshold: ${err.message}`));
            } else {
                // If the amount specified is larger than the mentions_ban setting return an error
                if (interaction.settings.moderation.mentions_ban && interaction.options.get("amount").value > interaction.settings.moderation.mentions_ban)
                    return interaction.error("The mentions-mute amount needs to be lower than the mentions-ban setting!");

                // Set max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.mentions_mute": interaction.options.get("amount").value })
                    .then(() => interaction.confirmation(`The mute threshold for message mentions has been set to \`${interaction.options.get("amount").value}\``))
                    .catch(err => interaction.error(`There was an error whilst setting the mute threshold: ${err.message}`));
            }
        } else if (sub == "mentions-ban") {
            if (interaction.options.get("amount").value === 0) {
                // If the max mentions is unset already, return an error
                if (!interaction.settings.moderation.mentions_ban)
                    return interaction.error("There is no ban threshold for message mentions currently set!");

                // Disable max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.mentions_ban": null })
                    .then(() => interaction.confirmation(`The ban threshold for message mentions has been disabled`))
                    .catch(err => interaction.error(`There was an error whilst disabling the ban threshold: ${err.message}`));
            } else {
                // If the amount specified is smaller than the mentions_mute setting return an error
                if (interaction.settings.moderation.mentions_mute && interaction.options.get("amount").value < interaction.settings.moderation.mentions_mute)
                    return interaction.error("The mentions-ban amount needs to be higher than the mentions-mute setting!");

                // Set max mantions in DB & retun confirmation - Catch any errors
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, { "moderation.mentions_ban": interaction.options.get("amount").value })
                    .then(() => interaction.confirmation(`The ban threshold for message mentions has been set to \`${interaction.options.get("amount").value}\``))
                    .catch(err => interaction.error(`There was an error whilst setting the ban threshold: ${err.message}`));
            }
        }

    }
};