const users = require("../../database/models/users");
const { getUser, getMember } = require("../../modules/functions/getters");
const { getRankCard } = require("../../modules/functions/leveling");

module.exports = {
    info: {
        name: "level",
        aliases: [
            "lvl",
            "checklevel",
            "xp",
            "rank"
        ],
        usage: "level [user]",
        examples: [
            "level @Jarno"
        ],
        description: "View the current level of a user.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
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
        enabled: false,
        opts: [{
            name: "user",
            type: "USER",
            description: "The user who's level you want to see.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        const user = await getUser(bot, message, args.join(" "), true) || await getMember(message, args.join(" "), true).then(m => { return m.user; });

        if (!user)
            return message.errorReply("You didn't specify a valid user!");

        const data = await users.findOne({ _id: user.id, "guilds.id": message.guild.id }),
        gData = data?.guilds.find(g => g.id == message.guild.id);

        if (!data)
            return message.errorReply("I couldn't find any data for the user you specified!");

        const xd = await getRankCard(user, gData, message.guild.id);

        message.reply({ files: [xd] });

    },

    run_interaction: async (bot, interaction) => {

        const user = interaction.options?.get("user")?.user ?? interaction.user;

        if (!user)
            return interaction.error("You didn't specify a valid user!");

        const data = await users.findOne({ _id: user.id, "guilds.id": interaction.guild.id }),
        gData = data?.guilds.find(g => g.id == interaction.guild.id);

        if (!data)
            return interaction.error("I couldn't find any data for the user you specified!");

        const xd = await getRankCard(user, gData, interaction.guild.id);

        interaction.reply({ files: [xd] });

    }
};