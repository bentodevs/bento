module.exports = {
    info: {
        name: "discord",
        aliases: [],
        usage: "discord <IGN>",
        examples: [
            "discord Forgetfully"
        ],
        description: "Fetch the Discord account associated with an IGN",
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
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

    }
};