module.exports = {
    info: {
        name: "unlink",
        aliases: [],
        usage: "unlink <user>",
        examples: [
            "unlink @waitrose"
        ],
        description: "Unlink a Discord account from a Minecraft account",
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
            name: "user",
            type: "USER",
            description: "The user to unlink an account for.",
            required: true
        }]
    },

    run: async (bot, message, args) => {

    },

    run_interaction: async (bot, interaction) => {

    }
};