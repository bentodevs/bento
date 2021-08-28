const { formatDistanceToNowStrict } = require("date-fns");
const premiumGuild = require("../../database/models/premiumGuild");
const { parseTime } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "givepremium",
        aliases: ["givepro", "obamacare"],
        usage: "givepremium <timeframe | \"forever\"> [server id]",
        examples: [],
        description: "Give a server premium",
        category: "Dev",
        info: "In the words of Bill and Ted: 'Don't be a dick'",
        options: []
    },
    perms: {
        permission: "dev",
        type: "",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: true,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        const server = bot.guilds.cache.get(args[1] ?? message.guild.id),
            guild = await premiumGuild.findOne({ _id: server.id });

        let time;

        if (args[0].toLowerCase() == "forever") time = "forever";
        if (args[0].toLowerCase() !== "forever") time = parseTime(args[0], "ms");

        // Reject if below 1 month
        if (time < 2628000000) return message.errorReply("The minimum time for premium access is 1 month!");

        if (parseInt(time)) time = Date.now() + time;

        if (!server)
            return message.errorReply("I couldn't find a server with that ID!");

        if (guild) {
            if (guild?.expiry > Date.now())
                return message.errorReply("This guild already has access to premium!");

        } else {
            await premiumGuild.create({
                _id: server.id,
                active: true,
                activatedBy: message.author.id,
                expiry: time
            });

            message.confirmationReply(`Successfully granted R2-D2 Premium to ${server.name} ${time == "forever" ? `**forever**` : `for **${formatDistanceToNowStrict(time)}**`}`);
        }

    }
};