const { stripIndents } = require("common-tags");
const reminders = require("../../database/models/reminders");
const users = require("../../database/models/users");

module.exports = {
    info: {
        name: "privacy",
        aliases: [],
        usage: "privacy [reminders | usernames | all]",
        examples: [
            "privacy usernames",
            "privacy all"
        ],
        description: "Allows you to instantly delete your data from R2-D2's database.",
        category: "Utility",
        info: null,
        options: [
            "`reminders` - Clear all your current reminders from the bot's database",
            "`usernames` - Clear your username history from the bot's database",
            "`all` - Clear both your reminder and username history data from the bot"
        ]
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
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        // Define allowed privacy categories
        const allowed = ["reminders", "usernames", "all"],
        // Define the filter and options
        filter = m => m.author.id == message.author.id,
        options = { time: 60000, max: 1, errors: ["time"] };

        if (args[0].toLowerCase() == "reminders") {
            if (!await reminders.findOne({ _id: message.author.id }))
                return message.errorReply("You do not have any reminders for me to clear!");
            
            const waiting = await message.reply(stripIndents`Are you sure you want me to clear all your reminders?
        
            Type \`y\` or \`yes\` to continue.`);

            // Await a response
            await message.channel.awaitMessages(filter, options).then(async msgs => {
                // Get the first response
                const m = msgs.first();
    
                // If the user typed "y" or "yes" leave the discord otherwise send the canceled message
                if (["y", "yes"].includes(m.content.toLowerCase())) {
                    await reminders.findOneAndDelete({ _id: message.author.id });
                    await m.delete();

                    waiting.edit(":ok_hand: Your reminders have been deleted");
                } else {
                    await m.delete();
                    waiting.edit(":ok_hand: The command has been canceled.");
                }
            }).catch((err) => {
                // Send an error message
                message.error(err.stack);
            });
        } else if (args[0].toLowerCase() == "usernames") {
            if (!await users.findOne({ _id: message.author.id })?.usernames?.length)
                return message.errorReply("You do not have any previous usernames for me to clear!");
            
            const waiting = await message.reply(stripIndents`Are you sure you want me to clear all your usernames?
        
            Type \`y\` or \`yes\` to continue.`);

            // Await a response
            await message.channel.awaitMessages(filter, options).then(async msgs => {
                // Get the first response
                const m = msgs.first();
    
                // If the user typed "y" or "yes" leave the discord otherwise send the canceled message
                if (["y", "yes"].includes(m.content.toLowerCase())) {
                    await users.findOneAndUpdate({ _id: message.author.id }, {usernames: []});
                    await m.delete();

                    waiting.edit(":ok_hand: Your previous usernames have been deleted");
                } else {
                    await m.delete();
                    waiting.edit(":ok_hand: The command has been canceled.");
                }
            }).catch((err) => {
                // Send an error message
                message.error(err.stack);
            });
        } else if (args[0].toLowerCase() == "all") {
            if (!await reminders.findOne({ _id: message.author.id }) && !await users.findOne({_id: message.author.id})?.usernames?.length)
                return message.errorReply("You do not have any data for me to clear!");
            
            const waiting = await message.reply(stripIndents`Are you sure you want me to clear your reminders and username history?
        
            Type \`y\` or \`yes\` to continue.`);

            // Await a response
            await message.channel.awaitMessages(filter, options).then(async msgs => {
                // Get the first response
                const m = msgs.first();
    
                // If the user typed "y" or "yes" leave the discord otherwise send the canceled message
                if (["y", "yes"].includes(m.content.toLowerCase())) {
                    await reminders.findOneAndDelete({ _id: message.author.id });
                    await users.findOneAndUpdate({ _id: message.author.id }, {usernames: []});
                    await m.delete();

                    waiting.edit(":ok_hand: Your reminders and previous usernames have been deleted");
                } else {
                    await m.delete();
                    waiting.edit(":ok_hand: The command has been canceled.");
                }
            }).catch((err) => {
                // Send an error message
                message.error(err.stack);
            });
        } else {
            return message.channel.send(`You must specify a valid option to manage your stored data! Valid settings are: \`${allowed.join("`, `")}\``);
        }
        
    }
};