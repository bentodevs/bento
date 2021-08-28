module.exports = {
    info: {
        name: "ign",
        aliases: [],
        usage: "ign <user>",
        examples: [
            "ign @Waitrose"
        ],
        description: "Fetch the linked Minecraft IGN for a user, or yourself",
        category: "Starcade",
        info: null,
        options: []
    },
    perms: {
        permission: "",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: true
    },
    slash: {
        enabled: true,
        opts: [{
            name: "user",
            type: "USER",
            description: "The user to fetch the IGN for.",
            required: false
        }]
    },

    run: async (bot, message, args) => {

    },

    run_interaction: async (bot, interaction) => {

    }
};