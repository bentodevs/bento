const { MessageEmbed } = require("discord.js");
const afk = require("../../database/models/afk");

module.exports = {
    info: {
        name: "afk",
        aliases: [],
        usage: "afk <\"status\"|\"list\"> [\"status to set\"|\"page\"]",
        examples: [
            "afk status I'm away for the day!",
            "afk list 2"
        ],
        description: "Set and view AFK statuses",
        category: "Miscellaneous",
        info: null,
        options: []
    },
    perms: {
        permission: "SEND_MESSAGES",
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
            name: "status",
            type: "SUB_COMMAND",
            description: "Set or view your AFK status.",
            options: [{
                name: "message",
                type: "STRING",
                description: "The AFK status you wish to show when you are mentioned. *Use off to disable*",
                required: false
            }]
        }, {
            name: "list",
            type: "SUB_COMMAND",
            description: "View all AFK users.",
            options: [{
                name: "page",
                type: "INTEGER",
                description: "The page to view.",
                required: false
            }]
        }]
    },

    run: async (bot, message, args) => {
        if (args[0].toLowerCase() === "status") {
            const data = await afk.findOne({ user: message.author.id, guild: message.guild.id });

            if (!args[1]) {
                if (!data)
                    return message.errorReply("You do not currently have an AFK status set!");
                
                return message.confirmationReply(`Your AFK status is currently sent to: ${data.status}`);
            } else {
                const int = args.splice(1).join(" ");

                if (int.toLowerCase() === "disable") {
                    if (!data)
                        return message.errorReply("You do not currently have an AFK status to disable!");
                    
                    await afk.findOneAndUpdate({ user: message.author.id, guild: message.guild.id }, { status: null });
                    return message.replyConfirmation("Your AFK status has been cleared");
                } else {
                    if (!data) {
                        await afk.create({ user: message.author.id, guild: message.guild.id, status: int.value, ignored: [] });
                    } else {
                        await afk.findOneAndUpdate({ user: message.author.id, guild: message.guild.id }, { status: int.value });
                    }
                    
                    return message.confirmationReply(`Your AFK status has been set to: ${int.value}`);
                }
            }
        } else if (args[0].toLowerCase() === "list") {
            const data = await afk.find({ guild: message.guild.id });

            const filtered = data.filter(a => message.guild.members.cache.has(a.user)).filter(b => b.status !== null);

            if (data.length === 0 || filtered.length === 0)
                return message.errorReply("There are no users with an AFK status!");
            
            // Pages variables
            const pages = [];
            let page = 0;

            // Sort members by role position
            const sorted = filtered.sort((a, b) => a.user - b.user);

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < sorted.length; i += 20) {
                pages.push(sorted.slice(i,i+20));
            }

            // If args[0] is a number set it as the page
            if (!isNaN()) 
                page = args[1].value -= 1;
            // Return if the page wasn't found
            if (!pages[page]) 
                return message.errorReply("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map(m => `**User:** ${message.guild.members.cache.get(m.user)} | **Status:** ${m.status ?? "Not set"}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor(`AFK members in ${message.guild.name}`, message.guild.iconURL({format: "png", dynamic: true}))
                .setFooter(`${filtered.length} total AFK members | Page ${page + 1} of ${pages.length}`)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description.join("\n"));
            
            // Send the members embed
            message.reply({ embeds: [embed] });
        } else {
            message.errorReply("You did not specify a valid option! Valid options are: `status`, `list`");
        }
    },

    run_interaction: async (bot, interaction) => {

        if (interaction.options.get("status")) {
            const data = await afk.findOne({ user: interaction.user.id, guild: interaction.guild.id });
            if (!interaction.options.get("status").options) {
                if (!data)
                    return interaction.error("You do not currently have an AFK status set!", { ephemeral: true });
                
                return interaction.confirmation(`Your AFK status is currently set to: ${data.status}`, { ephemeral: true });
            } else if (interaction.options.get("status").options.find(o => o.name === "message")) {
                const int = interaction.options.get("status").options.find(o => o.name === "message");

                if (int.value.toLowerCase() === "disable") {
                    if (!data)
                        return interaction.error("You do not currently have an AFK status to disable!", { ephemeral: true });
                    
                    await afk.findOneAndUpdate({ user: interaction.user.id, guild: interaction.guild.id }, { status: null });
                    return interaction.confirmation("Your AFK status has been cleared!", { ephemeral: true });
                } else {
                    if (!data) {
                        await afk.create({ user: interaction.user.id, guild: interaction.guild.id, status: int.value, ignored: [] });
                    } else {
                        await afk.findOneAndUpdate({ user: interaction.user.id, guild: interaction.guild.id }, { status: int.value });
                    }
                    
                    return interaction.confirmation(`Your AFK status has been set to: ${int.value}`, { ephemeral: true });
                }
            }
        } else if (interaction.options.get("list")) {
            const data = await afk.find({ guild: interaction.guild.id });
            const int = interaction.options.get("list")?.options?.find(o => o.name === "page");

            const filtered = data.filter(a => interaction.guild.members.cache.has(a.user)).filter(b => b.status !== null);

            if (data.length === 0 || filtered.length === 0)
                return interaction.error("There are no users with an AFK status!");
            
            // Pages variables
            const pages = [];
            let page = 0;

            // Sort members by role position
            const sorted = filtered.sort((a, b) => a.user - b.user);

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < sorted.length; i += 20) {
                pages.push(sorted.slice(i,i+20));
            }

            // If args[0] is a number set it as the page
            if (!isNaN()) 
                page = int.value -= 1;
            // Return if the page wasn't found
            if (!pages[page]) 
                return interaction.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map(m => `**User:** ${interaction.guild.members.cache.get(m.user)} | **Status:** ${m.status ?? "Not set"}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor(`AFK members in ${interaction.guild.name}`, interaction.guild.iconURL({format: "png", dynamic: true}))
                .setFooter(`${filtered.length} total AFK members | Page ${page + 1} of ${pages.length}`)
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description.join("\n"));
            
            // Send the members embed
            interaction.reply({ embeds: [embed] });
        }
    }
};