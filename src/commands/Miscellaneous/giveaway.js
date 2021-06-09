const { stripIndents } = require("common-tags");
const { formatDuration, intervalToDuration } = require("date-fns");
const { MessageEmbed } = require("discord.js");
const giveaways = require("../../database/models/giveaways");
const { getChannel, getUser } = require("../../modules/functions/getters");
const { parseTime, drawGiveawayWinners } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "giveaway",
        aliases: [
            "giveaways"
        ],
        usage: "giveaway <option>",
        examples: [
            "giveaway list 2",
            "giveaway start",
            "giveaway stop 5",
            "giveaway end 10",
            "giveaway reroll 1"
        ],
        description: "Start, manage & list giveaways.",
        category: "Miscellaneous",
        info: "",
        options: [
            "`list [page]` - List all giveaways.",
            "`start` - Starts the interactive giveaway setup.",
            "`stop <id>` - Stops an active giveaway without picking a winner.",
            "`end <id>` - Ends an active givewaway and picks a winner.",
            "`reroll <id>` - Re-roll the winner(s) of a giveaway."
        ]
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the option
        const option = args[0].toLowerCase();

        if (option == "list") {
            // Get all the giveaways
            const g = await giveaways.find({ "guild.guild_id": message.guild.id });

            // If there are no giveaways return an error
            if (!g.length)
                return message.error("There are no giveaways to list!");

            // Page Vars
            const pages = [];
            let page = 0;

            // Sort the giveaways by ID
            const sorted = g.sort((a, b) => a.id - b.id);

            // Loop through the giveaways and split them into pages of 10
            for (let i = 0; i < sorted.length; i += 10) {
                pages.push(sorted.slice(i, i + 10));
            }

            // Get the page
            if (!isNaN(args[1]))
                page = args[1] -= 1;

            // Format the description
            const description = pages[page].map(a => `${a.active ? bot.config.emojis.online : bot.config.emojis.dnd} | **ID:** ${a.id} | **Duration:** ${formatDuration(intervalToDuration({ start: a.timestamps.start, end: a.timestamps.ends }), { delimiter: "," })} | **Winners:** ${a.winners} | **Prize:** ${a.prize}`);

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Giveaways hosted in ${message.guild.name}`, message.guild.iconURL({ format: "png", dynamic: true }))
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description)
                .setFooter(`${g.length} Total Giveaways | Page ${page + 1} of ${pages.length}`);

            // Send the embed
            message.channel.send(embed);
        } else if (option == "start") {
            // Define the filter and message collector options
            const filter = m => m.author.id == message.author.id,
            options = { max: 1, time: 60000, errors: ["time"] };

            // Define the option vars
            let channel, time, winners, prize;

            // Send the channel message
            await message.channel.send(stripIndents`🎉 Alright! Let's setup a giveaway! First, where would you like the giveaway to start?
            
            \`Please type the name of a channel in this guild.\``);

            // Get the channel
            await message.channel.awaitMessages(filter, options).then(async msgs => {
                const m = msgs.first();

                if (m.content.toLowerCase() == "cancel") {
                    return message.confirmation("Alright, consider it canceled.");
                } else {
                    channel = await getChannel(m, m.content);
                }
            }).catch(() => {
                message.error("The giveaway has been canceled.");
            });

            // If no channel was specified return an error
            if (!channel)
                return message.error("You didn't specify a valid channel! The giveaway has been canceled.");
            // If the channel isn't a news or text channel return an error
            if (channel.type !== "news" && channel.type !== "text")
                return message.error("The channel you specified isn't a text or new channel. The giveaway has been canceled.");

            // Send the duration message
            await message.channel.send(stripIndents`🎉 Awesome! The giveaway will be hosted in ${channel}! Now, how long would you like the giveaway to last?
            
            \`Please enter the duration of the giveaway (Example: 1d2h equates to 1 day 2 hours)\``);

            // Get the giveaway duration
            await message.channel.awaitMessages(filter, options).then(async msgs => {
                const m = msgs.first();

                if (m.content.toLowerCase() == "cancel") {
                    return message.confirmation("Alright, consider it canceled.");
                } else {
                    time = parseTime(m.content, "ms");
                }
            }).catch(() => {
                message.error("The giveaway has been canceled.");
            });

            // If no duration was specified return an error
            if (!time)
                return message.error("You didn't specify a valid time! The giveaway has been canceled.");
            // If the duration is shorter than 1 minute return an error
            if (time < 60000)
                return message.error("The minumum time for a giveaway is 1 minute! The giveaway has been canceled.");
            // If the duration is longer than 1 year return an error
            if (time > 31556952000)
                return message.error("Giveaways cannot run for longer than 1 year! The giveaway has been canceled.");

            // Send the winners message
            await message.channel.send(stripIndents`🎉 Cool, the giveaway will run for **${formatDuration(intervalToDuration({ start: 0, end: time }), { delimiter: "," })}**. So, how many winners should there be?
            
            \`Please enter a number of winners, between 1 and 20\``);

            // Get the amount of winners
            await message.channel.awaitMessages(filter, options).then(async msgs => {
                const m = msgs.first();

                if (m.content.toLowerCase() == "cancel") {
                    return message.confirmation("Alright, consider it canceled.");
                } else {
                    winners = parseInt(m.content);
                }
            }).catch(() => {
                message.error("The giveaway has been canceled.");
            });

            // If no winners weres specified return an error
            if (!winners)
                return message.error("You didn't specify a valid number! The giveaway has been canceled.");
            // If more than 20 winners were specified return an error
            if (winners > 20)
                return message.error("You can't have more than 20 winners! The giveaway has been canceled.");
            // If 0 or less winners were specified return an error
            if (winners <= 0)
                return message.error("You must have at least 1 winner! The giveaway has been canceled.");

            // Send the prize message
            await message.channel.send(stripIndents`🎉 Alright, there will be **${winners}** winners. Lastly, what would you like the prize(s) to be?
            
            \`Please enter the giveaway prize. This aditionally starts the giveaway.\``);

            // Get the prize
            await message.channel.awaitMessages(filter, options).then(async msgs => {
                const m = msgs.first();

                if (m.content.toLowerCase() == "cancel") {
                    return message.confirmation("Alright, consider it canceled.");
                } else {
                    prize = m.content;
                }
            }).catch(() => {
                message.error("The giveaway has been canceled!");
            });

            // If no prize was specified
            if (!prize)
                return message.error("You didn't specify a prize! The giveaway has been canceled.");
            // If the giveaway title is longer than 256 characters return an error (https://discordjs.guide/popular-topics/embeds.html#embed-limits)
            if (`Giveaway: ${prize}`.length > 256)
                return message.error("Please enter a shorter prize name! The giveaway has been canceled.");

            // Get the giveaway ID, start time and end time
            const id = await giveaways.countDocuments({ "guild.guild_id": message.guild.id }) + 1 || 1,
            start = Date.now(),
            end = Date.now() + time;

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Giveaway: ${prize}`, message.guild.iconURL({ dynamic: true, format: "png" }))
                .setDescription(stripIndents`React with 🎉 to enter the giveaway!
                
                **Duration:** ${formatDuration(intervalToDuration({ start: start, end: end }), { delimiter: "," })}
                **Hosted By:** ${message.author}`)
                .setTimestamp(end)
                .setColor(bot.config.general.embedColor)
                .setFooter(`${winners} winners | Ends`);

            // Send the embed & add the reaction
            const message_id = await channel.send(embed).then(msg => { msg.react("🎉"); return msg.id; });

            // Create the db entry
            await giveaways.create({
                id: id,
                guild: {
                    guild_id: message.guild.id,
                    message_id: message_id,
                    channel_id: channel.id
                },
                creator: message.author.id,
                winners: winners,
                prize: prize,
                entries: [],
                timestamps: {
                    start: start,
                    ends: end,
                    length: time
                },
                active: true
            });

            // Send a confirmation message
            message.channel.send(`🎉 Nice, the giveaway for \`${prize}\` is now starting in ${channel}!`);
        } else if (option == "stop") {
            // Get the giveaway ID
            const id = parseInt(args[1]);

            // If an invalid ID was specified return an error
            if (!id)
                return message.error("You must provide a numeric giveaway ID!");

            // Get the giveaway
            const g = await giveaways.findOne({ "guild.guild_id": message.guild.id, id: id, active: true });

            // If the giveaway wasn't found return an error
            if (!g)
                return message.error("There is no giveaway with that ID or the giveaway is not active!");

            // Get the giveaway message
            const msg = await message.guild.channels.cache.get(g.guild.channel_id)?.messages.fetch(g.guild.message_id).catch(() => {});

            // Delete the giveaway message and set the giveaway to inactive
            await msg?.delete().catch(() => {});
            await giveaways.findOneAndUpdate({ "guild.guild_id": message.guild.id, id: id, active: true }, { active: false });

            // Send a confirmation
            message.confirmation(`The giveaway with the ID \`${g.id}\` has been cancelled!`);
        } else if (option == "end") {
            // Get the giveaway ID
            const id = parseInt(args[1]);

            // If an invalid ID was specified return an error
            if (!id)
                return message.error("You must provide a numeric giveaway ID!");

            // Get the giveaway
            const g = await giveaways.findOne({ "guild.guild_id": message.guild.id, id: id, active: true });

            // If the giveaway wasn't found return an error
            if (!g)
                return message.error("There is no giveaway with that ID or the giveaway is not active!");

            // Get the winners and define the array
            const winners = drawGiveawayWinners(g.entries, g.winners),
            arr = [];

            // Loop through the winners
            for (const data of (winners)) {
                // Get the user
                const user = await getUser(bot, message, data);

                // If the user exists add it to the array otherwise add <deleted user>
                if (user) {
                    arr.push(user);
                } else {
                    arr.push("<deleted user>");
                }
            }

            // Get the channel, message and giveaway creator
            const channel = message.guild.channels.cache.get(g.guild.channel_id),
            msg = await channel?.messages.fetch(g.guild.message_id).catch(() => {}),
            creator = message.guild.members.cache.get(g.creator);

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Giveaway: ${g.prize}`, message.guild.iconURL({ dynamic: true, format: "png" }))
                .setDescription(`${arr.length ? arr.length > 1 ? `**Winners:**\n${arr.join("\n")}` : `**Winner:** ${arr.join("\n")}`  : "Could not determine a winner!"}\n**Hosted By:** ${creator}`)
                .setTimestamp(Date.now())
                .setColor(bot.config.general.embedColor)
                .setFooter(`${g.winners} winners | Ended at`);

            // Update the embed
            msg?.edit(embed);

            // Set the giveaway to inactive in the db
            await giveaways.findOneAndUpdate({ "guild.guild_id": message.guild.id, id: id, active: true }, {
                active: false
            });

            // If no winners were selected return an error otherwise announce the winners
            if (!arr.length) {
                channel?.send(`${bot.config.emojis.error} A winner could not be determined!`);
            } else {
                channel?.send(`🎉 Congratulations to ${arr.join(", ")} on winning the giveaway for \`${g.prize}\`!`);
            }

            // Send a confirmation message
            message.confirmation("Successfully ended that giveaway!");
        } else if (option == "reroll") {
            // Get the giveaway ID
            const id = parseInt(args[1]);

            // If an invalid ID was specified return an error
            if (!id)
                return message.error("You must provide a numeric giveaway ID!");

            // Get the giveaway
            const g = await giveaways.findOne({ "guild.guild_id": message.guild.id, id: id, active: false });

            // If the giveaway wasn't found return an error
            if (!g)
                return message.error("There is no giveaway with that ID or the giveaway is still active!");

            // Get the winners and define the array
            const winners = drawGiveawayWinners(g.entries, g.winners),
            arr = [];

            // Loop through the winners
            for (const data of (winners)) {
                // Get the user
                const user = await getUser(bot, message, data);

                // If the user exists add it to the array otherwise add <deleted user>
                if (user) {
                    arr.push(user);
                } else {
                    arr.push("<deleted user>");
                }
            }

            // Send the new winners
            message.channel.send(`The giveaway in ${message.guild.channels.cache.get(g.channel) ? message.guild.channels.cache.get(g.channel) : "<deleted channel>"} was re-rolled. The new winner(s) are ${arr.join(", ")}!`);
            message.guild.channels.cache.get(g.channel)?.send(`🎉 The giveaway was re-rolled - The new winner(s) are ${arr.join(", ")}!`);
        } else {
            // Send an error message
            return message.error("You didn't specify a valid option! Try one of these: `start`, `stop`, `end` or `reroll`!");
        }

    }
};