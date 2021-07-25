const { MessageEmbed } = require("discord.js");
const { getMember } = require("../../modules/functions/getters");
const { fetchWaifuApi } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "hug",
        aliases: [],
        usage: "hug [member]",
        examples: [
            "hug @Jarno"
        ],
        description: "Sends a GIF of an anime character getting hugged.",
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
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "member",
            type: "USER",
            description: "The member you want to hug.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // Fetch the image
        const URL = await fetchWaifuApi("hug"),
        member = await getMember(message, args.join(" "), true);
        
        if (!member)
            return message.errorReply("It doesn't look like that member exists!");

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);
        
        // Send the embed
        message.reply(`${member} got hugged`, embed);

    },

    run_interaction: async (bot, interaction) => {

        // Fetch the image
        const URL = await fetchWaifuApi("hug"),
        member = interaction.options.get("member")?.value ?? interaction.member;

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor);
        
        // Send the embed
        interaction.reply(`${member} got hugged`, embed);

    }
};