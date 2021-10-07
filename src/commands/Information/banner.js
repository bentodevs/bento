const { MessageEmbed } = require("discord.js");
const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "banner",
        aliases: ["background"],
        usage: "banner [user]",
        examples: [
            "banner Waitrose"
        ],
        description: "Display the banner of a user or yourself.",
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
    slash: {
        enabled: true,
        opts: [{
            name: "user",
            type: "USER",
            description: "The user who's banner you want to display.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // Get the user
        const target = await getMember(message, args.join(" "), true)?.user || await getUser(bot, message, args.join(" "), true);

        // If a invalid user was specified return an error
        if (!target)
            return message.errorReply("You didn't specify a valid user!");

        // Force fetch the target from the API
        // https://discord.js.org/#/docs/main/stable/class/User?scrollTo=bannerURL
        const usr = await bot.users.fetch(target.id, { force: true });

        if (!usr.bannerURL()) {
            return message.errorReply("This user doesn't have a custom banner set!");
        }

        // Build the embed
        const embed = new MessageEmbed()
            .setColor(message.member?.displayColor || bot.config.general.embedColor)
            .setAuthor(`Banner for ${target.tag}`, target.displayAvatarURL({ format: "png", dynamic: true }))
            .setImage(usr.bannerURL({ format: "png", dynamic: true, size: 2048}));

        // Send the embed
        message.reply({ embeds: [embed] });

    },

    run_interaction: async (bot, interaction) => {

        // Get the user
        const target = interaction.options.get("user")?.user ?? interaction.user;

        // Force fetch the target from the API
        // https://discord.js.org/#/docs/main/stable/class/User?scrollTo=bannerURL
        const usr = await bot.users.fetch(target.id, { force: true });

        if (!usr.bannerURL()) {
            return interaction.errorReply({content: "This user doesn't have a custom banner set!", ephemeral: true});
        }

        // Build the embed
        const embed = new MessageEmbed()
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setAuthor(`Avatar for ${target.tag}`, target.displayAvatarURL({ format: "png", dynamic: true }))
            .setImage(usr.bannerURL({ format: "png", dynamic: true, size: 2048}));

        // Send the embed
        interaction.reply({ embeds: [embed] });

    }
};