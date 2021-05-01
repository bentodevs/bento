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

    run: async (bot, message, args) => {

        async function getCaseUser(bot, message, user) {

            const usr = await getUser(bot, message, user, false);

            return `${usr.username}#${usr.discriminator}`;
        }

        // Fetch member
        const member = await getMember(message, args[0], true);
        
        if (!member)
            return message.error();
        
        const cases = await punishments.find({ guild: message.guild.id, moderator: member.user.id });

        if (cases.length === 0)
            return message.error();
        
        // Page variables
        const pages = [];
        let page = 0;
        
        const sorted = cases.sort((a, b) => a.actionTime - b.actionTime);

        // Set cases in page array
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // Get the correct page, if the user provides a page number
        if (!Number.isNaN(args[1])) page = args[1] -= 1;

        // Check if the user specified a valid page
        if (!pages[page])
            return message.error("You didn't specify a valid page!");
        
        // Format the cases
        const formatted = pages[page].map(async p => `**#${p.id}** | **${p.type.toTitleCase()}** | **User:** ${await getCaseUser(bot, message, p.user)} | **Reason:** ${p.reason}`);
        
        // Build the history embed
        const embed = new MessageEmbed()
            .setAuthor(`Punishment by ${member.user.tag}`, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setColor(message.member.displayHexColor ?? bot.config.general.embedColor)
            .setDescription(formatted.join('\n'))
            .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);
        
        // Send the history embed
        message.channel.send(embed);
    }
};