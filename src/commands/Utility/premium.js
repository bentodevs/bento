const { formatDistance } = require("date-fns");
const premiumGuild = require("../../database/models/premiumGuild");
const { getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "premium",
        aliases: ["pro", "subscription"],
        usage: "",
        examples: [],
        description: "Check your premium status.",
        category: "Utility",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: []
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
        opts: []
    },

    run: async (bot, message) => {

        const premiumSearch = await premiumGuild.findOne({ _id: message.guild.id, active: true });

        if (!premiumSearch)
            return message.errorReply("This guild doesn't currently have an active R2-D2 Premium subscription! You can purchase access to R2-D2 premium on our website: https://r2-d2.dev/");

        const user = await getUser(bot, message, premiumSearch.activatedBy, false);

        message.confirmationReply(`This server has an active premium subscription provided by **${user.tag}** which ${premiumSearch.expiry == "forever" ? "**does not expire**" : `expires in **${formatDistance(Date.now(), parseInt(premiumSearch.expiry))}**`}!`);

    }
};