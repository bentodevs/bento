module.exports = {
    info: {
        name: "voteleaderboard",
        aliases: [
            "vlb",
            "votes"
        ],
        usage: "voteleaderboard [month] [page]",
        examples: [
            "voteleaderboard january",
            "voteleaderboard 2",
            "voteleaderboard july 3"
        ],
        description: "View the voting leaderboard",
        category: "Starcade",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: true
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

    }
};