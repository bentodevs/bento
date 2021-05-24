module.exports = {
    info: {
        name: "filter",
        aliases: [],
        usage: "filter [setting/page] [value]",
        examples: ["filter add badword", "filter remove badword", "filter list", "filter list 2"],
        description: "Manage the chat filter",
        category: "Settings",
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
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {
        // Code here
    }
};