const { formatDuration, intervalToDuration } = require("date-fns");
const settings = require("../../database/models/settings");
const { parseTime } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "minage",
        aliases: [],
        usage: "minage [time | \"disable\"]",
        examples: [
            "minage 1d",
            "minage disable"
        ],
        description: "Sets the minimum required account age to join the guild.",
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
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        if (!args[0]) {
            // If no minimum age is set return an error
            if (!message.settings.moderation.minimumAge)
                return message.error("This guild does not have a minimum account age!");

            // Send the current minimum age
            message.confirmation(`The minimum account age to join this guild is **${formatDuration(intervalToDuration({ start: 0, end: message.settings.moderation.minimumAge }))}**!`);
        } else {
            if (args[0].toLowerCase() == "disable") {
                // If the minimum age is already disabled return an error
                if (!message.settings.moderation.minimumAge)
                    return message.error("The minimum account age is already disabled!");

                // Disable the minimum age
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    "moderation.minimumAge": null
                });

                // Send a confirmation message
                message.confirmation("Successfully disabled the minimum account age!");
            } else {
                // Get the time
                const time = parseTime(args[0], "ms");

                // If an invalid time was specified return an error
                if (!time)
                    return message.error("You didn't specify a valid time!");
                // If the specified time is the same as the current minimum age return an error
                if (message.settings.moderation.minimumAge == time)
                    return message.error("The time you specified is already set as the minimum required account age!");

                // Update the database
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    "moderation.minimumAge": time
                });

                // Send a confirmation message
                message.confirmation(`Successfully set the minimum required account age of new users to **${formatDuration(intervalToDuration({ start: 0, end: time }))}**!`);
            }
        }

    }
};