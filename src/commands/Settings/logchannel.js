const { MessageEmbed } = require("discord.js");
const settings = require("../../database/models/settings");
const { getChannel } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "logchannel",
        aliases: ["logs", "log"],
        usage: "logchannel [option] <value>",
        examples: ["log deleted #message-logs", "log commands disable"],
        description: "Change or view logging settings",
        category: "Settings",
        info: null,
        options: [
            `\`default\` - logs moderation and some other things`,
            `\`commands\` - logs any bot commands that get executed`,
            `\`edited\` - logs all edited messages`,
            `\`deleted\` - logs all deleted messages`,
            `\`events\` - set the log channel for manual events`
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
            name: "option",
            type: "STRING",
            description: "Choose an option.",
            choices: [
                { name: "default", value: "default" },
                { name: "commands", value: "commands" },
                { name: "edited", value: "edited" },
                { name: "deleted", value: "deleted" },
                { name: "events", value: "events" }
            ],
            required: false
        }, {
            name: "channel",
            type: "CHANNEL",
            description: "Select the channel you want to use.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // Get the option
        const option = args?.[0]?.toLowerCase();

        if (!option) {
            // Define logs
            const logs = message.settings.logs;

            // Get all the log channels
            const defaultLogs = message.guild.channels.cache.get(logs.default),
            eventLogs = message.guild.channels.cache.get(logs.events),
            commandLogs = message.guild.channels.cache.get(logs.commands),
            editedLogs = message.guild.channels.cache.get(logs.edited),
            deletedLogs = message.guild.channels.cache.get(logs.deleted);

            // Define the embed message
            let msg = "";
            
            // Prepare the embed message
            if (logs.default && defaultLogs) msg += `🗨️ The default log channel is set to ${defaultLogs}\n\n`; else msg += "🗨️ The default log channel is not set\n\n";
            if (logs.commands && commandLogs) msg += `🔧 Command logging is set to ${commandLogs}\n`; else msg += "🔧 Command logging is **disabled**\n";
            if (logs.edited && editedLogs) msg += `📝 Edited message logging is set to ${editedLogs}\n`; else msg += "📝 Edited message logging is **disabled**\n";
            if (logs.deleted && deletedLogs) msg += `:wastebasket: Deleted message logging is set to ${deletedLogs}\n`; else msg += ":wastebasket: Deleted message logging is **disabled**\n";
            if (logs.events && eventLogs) msg += `:bell: Event logging is set to ${eventLogs}\n`; else msg += ":bell: Event logging is **disabled**\n";
            
            // Create the embed
            const embed = new MessageEmbed()
                .setTitle("Logging")
                .setThumbnail("https://i.imgur.com/iML7LKF.png")
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(msg);

            // Send the embed
            message.reply({ embeds: [embed] });
        } else {
            // Define the valid logging options
            const options = ["default", "events", "commands", "edited", "deleted"];

            // If the option the user specified isn't a valid option return an error
            if (!options.includes(option))
                return message.errorReply(`You didn't specify a valid option! Valid options are: \`${options.join("`, `")}\``);

            // If the user didn't specify a channel return an error
            if (!args[1])
                return message.errorReply("You didn't specify a channel!");

            if (args[1].toLowerCase() === "disable") {
                // If the option is already disabled return an error
                if (!message.settings.logs?.[option])
                    return message.errorReply("I can't disable something that is already disabled...");
                
                // Disable the option
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    [`logs.${option}`]: null
                });
                // Send a confirmation message
                message.confirmationReply(`${option} logging has been disabled!`);

                // Return
                return;
            }

            // Grab the channel
            const channel = await getChannel(message, args.slice(1).join(" "));

            // If no channel could be found return an error
            if (!channel)
                return message.errorReply("You didn't specify a valid channel!");

            // If the channel isn't a text channel return an error
            if (channel.type !== "text")
                return message.errorReply("The channel you specified isn't a text channel!");

            // Set the logging channel
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                [`logs.${option}`]: channel.id
            });

            // Send a confirmation message based on the option
            switch(option) {
                case "default":
                    message.confirmationReply(`${channel} will now be used as the default logging channel!`);
                    break;
                case "events":
                case "commands":
                    message.confirmationReply(`${channel} will now be used as the logging channel for \`${option}\`!`);
                    break;
                case "edited":
                case "deleted":
                    message.confirmationReply(`${channel} will now be used as the logging channel for \`${option} messages\`!`);
                    break;
            }
        }

    },

    run_interaction: async (bot, interaction) => {

        // Get the option
        const option = interaction.options?.get("option")?.value;

        if (!option) {
            // Define logs
            const logs = interaction.settings.logs;

            // Get all the log channels
            const defaultLogs = interaction.guild.channels.cache.get(logs.default),
            eventLogs = interaction.guild.channels.cache.get(logs.events),
            commandLogs = interaction.guild.channels.cache.get(logs.commands),
            editedLogs = interaction.guild.channels.cache.get(logs.edited),
            deletedLogs = interaction.guild.channels.cache.get(logs.deleted);

            // Define the embed message
            let msg = "";
            
            // Prepare the embed message
            if (logs.default && defaultLogs) msg += `🗨️ The default log channel is set to ${defaultLogs}\n\n`; else msg += "🗨️ The default log channel is not set\n\n";
            if (logs.commands && commandLogs) msg += `🔧 Command logging is set to ${commandLogs}\n`; else msg += "🔧 Command logging is **disabled**\n";
            if (logs.edited && editedLogs) msg += `📝 Edited message logging is set to ${editedLogs}\n`; else msg += "📝 Edited message logging is **disabled**\n";
            if (logs.deleted && deletedLogs) msg += `:wastebasket: Deleted message logging is set to ${deletedLogs}\n`; else msg += ":wastebasket: Deleted message logging is **disabled**\n";
            if (logs.events && eventLogs) msg += `:bell: Event logging is set to ${eventLogs}\n`; else msg += ":bell: Event logging is **disabled**\n";
            
            // Create the embed
            const embed = new MessageEmbed()
                .setTitle("Logging")
                .setThumbnail("https://i.imgur.com/iML7LKF.png")
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(msg);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else {
            // Grab the channel
            const channel = interaction.options.get("channel")?.channel;

            // If no channel could be found return an error
            if (!channel)
                return interaction.error("You didn't specify a valid channel!");

            // If the channel isn't a text channel return an error
            if (channel.type !== "text")
                return interaction.error("The channel you specified isn't a text channel!");

            // Set the logging channel
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                [`logs.${option}`]: channel.id
            });

            // Send a confirmation message based on the option
            switch(option) {
                case "default":
                    interaction.confirmation(`${channel} will now be used as the default logging channel!`);
                    break;
                case "events":
                case "commands":
                    interaction.confirmation(`${channel} will now be used as the logging channel for \`${option}\`!`);
                    break;
                case "edited":
                case "deleted":
                    interaction.confirmation(`${channel} will now be used as the logging channel for \`${option} messages\`!`);
                    break;
            }
        }

    }
};