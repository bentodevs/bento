const { MessageEmbed } = require("discord.js");
const punishments = require("../../database/models/punishments");
const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "caseby",
        aliases: ["modactions"],
        usage: "caseby <Moderator>",
        examples: ["caseby Waitrose"],
        description: "Lists actions taken by a Moderator",
        category: "Moderation",
        info: null,
        options: null
    },
    perms: {
        permission: "KICK_MEMBERS",
        type: "discord",
        self: ["EMBED_LINKS"],
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
            name: "user",
            type: "USER",
            description: "The user to lookup.",
            required: true
        }, {
            name: "page",
            type: "INTEGER",
            description: "The page to view.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        async function getCaseUser(bot, message, user) {

            const usr = await getUser(bot, message, user, false);

            return `${usr.username}#${usr.discriminator}`;
        }

        // Fetch member
        const member = await getMember(message, args[0], true);

        if (!member)
            return message.errorReply("That member doesn't seem to exist in this guild!");

        const cases = await punishments.find({ guild: message.guild.id, moderator: member.user.id });

        if (cases.length === 0)
            return message.errorReply("That user has not created any punishments!");

        // Page variables
        const pages = [];
        let page = 0;

        const sorted = cases.sort((a, b) => a.actionTime - b.actionTime);

        // Set cases in page array
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // Get the correct page, if the user provides a page number
        if (!isNaN(args[1])) page = args[1] -= 1;

        // Check if the user specified a valid page
        if (!pages[page])
            return message.errorReply("You didn't specify a valid page!");

        // Format the cases
        const formatted = Promise.all(pages[page].map(async p => `**#${p.id}** | **${p.type.toTitleCase()}** | **User:** ${await getCaseUser(bot, message, p.user)} | **Reason:** ${p.reason}`));
        const data = await formatted;

        // Build the history embed
        const embed = new MessageEmbed()
            .setAuthor(`Punishments by ${member.user.tag}`, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setColor(message.member?.displayColor || bot.config.general.embedColor)
            .setDescription(data.join("\n"))
            .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);

        // Send the history embed
        message.reply({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {

        // Defer the interaction
        await interaction.deferReply();

        // Make a function for getting case users - less head-work
        async function getCaseUser(bot, interaction, user) {
            // Fetch the user from the API
            const usr = await getUser(bot, interaction, user, false);

            // Return the user in tag-style
            return `${usr.username}#${usr.discriminator}`;
        }

        // Get the member and page number
        const member = interaction.options.get("user"),
        int = interaction.options.get("page");

        // If the user doesn't exist, then return an error
        if (!member.user)
            return interaction.error("That user doesn't seem to exist!");

        // Fetch all cases in the current guild, by the user
        const cases = await punishments.find({ guild: interaction.guild.id, moderator: member.user.id });

        // If there are no cases, return an error
        if (cases.length === 0)
            return interaction.error("That user has not created any punishments!");

        // Page variables
        const pages = [];
        let page = 0;

        const sorted = cases.sort((a, b) => a.actionTime - b.actionTime);

        // Set cases in page array
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // If args[0] is a number set it as the page
        if (int)
            page = int.value -= 1;


        // Check if the user specified a valid page
        if (!pages[page])
            return interaction.error("You didn't specify a valid page!");

        // Format the cases
        const formatted = Promise.all(pages[page].map(async p => `**#${p.id}** | **${p.type.toTitleCase()}** | **User:** ${await getCaseUser(bot, interaction, p.user)} | **Reason:** ${p.reason}`));
        const data = await formatted;

        // Build the history embed
        const embed = new MessageEmbed()
            .setAuthor(`Punishments by ${member.user.tag}`, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setColor(interaction.member.displayColor ?? bot.config.general.embedColor)
            .setDescription(data.join('\n'))
            .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);

        // Send the history embed
        interaction.editReply({ embeds: [embed] });
    }
};