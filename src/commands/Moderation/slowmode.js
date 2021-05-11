const { formatDuration, intervalToDuration } = require("date-fns");
const { getChannel } = require("../../modules/functions/getters");
const { parseTime } = require("../../modules/functions/misc");

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
        permission: "MANAGE_CHANNELS",
        type: "discord",
        self: ["MANAGE_CHANNELS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the channel and the time
        const channel = await getChannel(message, args.slice(1).join(" "), true);
        let time = parseTime(args[0], "seconds");

        // If the user specified "off" set the time to 0
        if (args[0].toLowerCase() == "off")
            time = 0;

        // If an invalid channel was specified return an error
        if (!channel)
            return message.error("You didn't specify a valid channel!");
        // If an invalid time was specified return an error
        if (!time && time !== 0)
            return message.error("You didn't specify a valid time!");
        // If the time is higher than 6 hours return an error
        if (time > 21600)
            return message.error("The slow mode cannot be higher than 6 hours!");

        // Set the rate limit
        channel.setRateLimitPerUser(time, `[Issued by ${message.author.tag}]`);
        // Send a confirmation message
        message.confirmation(time === 0 ? `Slowmode turned off for ${channel}!` : `Slowmode set for ${channel} to **${formatDuration(intervalToDuration({ start: 0, end: time * 1000 }), { delimiter: ", " })}**!`);

    }
};