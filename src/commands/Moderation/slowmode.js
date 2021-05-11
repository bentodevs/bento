module.exports = {
    info: {
        name: "slowmode",
        aliases: [
            "slow",
            "slowchat",
            "chatslow"
        ],
        usage: "slowmode <time | \"off\"> [channel]",
        examples: [
            "slowmode 3s",
            "slowmode 1m #commands",
            "slowmode off"
        ],
        description: "Set the slowmode of a channel.",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: ["MANAGE_CHANNELS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

    }
};