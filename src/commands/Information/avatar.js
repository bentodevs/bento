const { MessageEmbed } = require("discord.js");
const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "avatar",
        aliases: ["av", "a"],
        usage: "avatar [user]",
        examples: [
            "avatar Jarno"
        ],
        description: "Display the avatar of a user or yourself.",
        category: "Information",
        info: null,
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

    run: async (bot, message, args) => {

        // Get the user
        const target = await getMember(message, args.join(" "), true)?.user || await getUser(bot, message, args.join(" "), true);

        // If a invalid user was specified return an error
        if (!target)
            return message.error("You didn't specify a valid user!");

        // Build the embed
        const embed = new MessageEmbed()
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setAuthor(`Avatar for ${target.tag}`, target.displayAvatarURL({ format: "png", dynamic: true }))
            .setImage(target.displayAvatarURL({ format: "png", dynamic: true, size: 1024}));

        // Send the embed
        message.channel.send(embed);

    }
};