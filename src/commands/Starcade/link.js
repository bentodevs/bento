module.exports = {
    info: {
        name: "link",
        aliases: [],
        usage: "link <code>",
        examples: [
            "link 123456"
        ],
        description: "Link your Discord account to your Minecraft IGN",
        category: "Starcade",
        info: null,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: true
    },
    slash: {
        enabled: true,
        opts: [{
            name: "code",
            type: "NUMBER",
            description: "The code given to you in-game",
            required: true
        }]
    },

    run: async (bot, message, args) => {

    },

    run_interaction: async (bot, interaction) => {

    }
};