const { MessageEmbed } = require("discord.js");
const { getMember } = require("../../modules/functions/getters");
const { fetchWaifuApi } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "kiss",
        aliases: [],
        usage: "kiss <member>",
        examples: [
            "kiss @Jarno"
        ],
        description: "Sends a GIF of anime characters kissing.",
        category: "Weebs",
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "member",
            type: "USER",
            description: "The member you want to bonk.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

        // Fetch the image
        const URL = await fetchWaifuApi("kiss"),
            member = await getMember(message, args.join(" "), true);
        
        if (!member)
            return message.errorReply("It doesn't look like that member exists!");

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);
        
        // Send the embed
        message.reply(`${message.member} kissed ${member}`, embed);

    },

    run_interaction: async (bot, interaction) => {

        // Fetch the image
        const URL = await fetchWaifuApi("kiss"),
        member = interaction.options.get("member").member;

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor);
        
        // Send the embed
        interaction.reply(`${interaction.member} kissed ${member}`, embed);

    }
};