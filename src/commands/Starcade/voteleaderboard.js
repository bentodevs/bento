const { format, parse } = require("date-fns");
const { MessageEmbed } = require("discord.js");
const config = require("../../config");
const { getVotes } = require("../../modules/functions/starcade");

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

        // Define the months
        const months = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december"
        ];

        // Fetch the current month
        let month = format(Date.now(), "MM-yyyy"),
            failed = false;

        // If a month was provided, check that it is valid
        if (args[0] && isNaN(args[0])) {
            if (months.includes(args[0].toLowerCase())) {
                month = format(parse(args[0].toLowerCase(), "MMMM", new Date()), "MM-yyyy");
            } else {
                return message.errorReply("You did not specify a valid month!");
            }
        }

        // Fetch the vote data and sort it
        const data = await getVotes(month).catch(() => {
            message.errorReply(`I ran into an issue fetching the Vote data for **${format(parse(month, "MM-yyyy", new Date()), "MMMM")}**!`);
            failed = true;
        });

        // If the data fetching failed, then return an error
        if (failed)
            return;

        // Sort the data
        const sorted = data?.sort((a, b) => b.votes[0].votes - a.votes[0].votes);

        // Define the page variables
        const pages = [];
        let page = 0;

        // Split the votes up into pages of 10
        for (let i = 0; i < sorted.length; i += 10) {
            pages.push(sorted.slice(i, i + 10));
        }

        // Get the page
        if (!isNaN(args[0])) page = args[0] -= 1;
        if (!isNaN(args[1])) page = args[1] -= 1;

        // If the page doesn't return an error
        if (!pages[page])
            return message.errorReply("You did not specify a valid page");

        // Format the page data
        const leaderboard = pages[page].examples((a, i) => `**${i + 1}.** ${a.username_formatted} - **${a.votes[0].votes}** vote${a.votes[0].votes > 1 ? "s" : ""}`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Vote Leaderboard - ${format(parse(month, "MM-yyyy", new Date()), "MMMM")}`, message.guild.iconURL({ format: "png", dynamic: true }))
            .setColor(message.member.displayColor ?? config.general.embedColor)
            .setDescription(leaderboard.join(`\n`))
            .setTimestamp()
            .setFooter(`${sorted.length} total users | Page ${page + 1} of ${pages.length}`);

        // Send the embed
        message.channel.send({ embeds: [embed] });

    }
};