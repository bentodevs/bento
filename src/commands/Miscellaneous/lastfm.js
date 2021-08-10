const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const config = require("../../config");
const users = require("../../database/models/users");
const { getMember, getUser } = require("../../modules/functions/getters");
const { getLastFMUser, getLastFMUserHistory } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "lastfm",
        aliases: ["lfm", "fmm"],
        usage: "lastfm [\"set\" | \"recent\"] <last.fm username | discord user>",
        examples: [
            "lastfm",
            "lastfm set WaitroseDev",
            "lastfm recent @Jarno"
        ],
        description: "Get Last.fm information about a user",
        category: "Miscellaneous",
        info: "Using the command with no options will show what you are currently listening to.",
        options: [
            "`set` - Set your Last.fm username",
            "`recent` - View the last 10 tracks a discord user has played (If they set a Last.fm account)"
        ]
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
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
        opts: [{
            name: "playing",
            type: "SUB_COMMAND",
            description: "View your current Last.fm track",
            options: []
        }, {
            name: "set",
            type: "SUB_COMMAND",
            description: "Set or view your Last.fm username",
            options: [{
                name: "username",
                type: "STRING",
                description: "The Last.fm username to set",
                required: false
            }]
        }, {
            name: "recent",
            type: "SUB_COMMAND",
            description: "View the 10 most recent tracks for yourself or another user",
            options: [{
                name: "user",
                type: "USER",
                description: "The user to get recent songs for",
                required: false
            }]
        }]
    },

    run: async (bot, message, args) => {

        if (!args[0]) {
            // Fetch the user from Mongo
            const userData = await users.findOne({ _id: message.author.id });

            // If the user hasn't got a lastfm account present, then return
            if (!userData.lastfm)
                return message.errorReply(`You do not have a Last.fm account set! Set one with \`${message.settings.general.prefix}lastfm set <username>\``);

            // 1. Fetch the user's listening history
            // 2. Get the latest track
            const history = await getLastFMUserHistory(userData.lastfm).catch(err => message.errorReply(`I encountered an error getting your play history: ${err}`)),
            latestTrack = history.recenttracks.track[0];

            // If the latest track doesn't have the nowplaying property, then return an error
            if (!latestTrack?.["@attr"].nowplaying)
                return message.errorReply("It looks like you aren't playing anything right now!");

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`${latestTrack.name} by ${latestTrack.artist?.["#text"]}`, latestTrack.image[1]["#text"], latestTrack.url)
                .setThumbnail(latestTrack.image[3]["#text"])
                .setColor(message?.member.displayColor ?? config.general.embedColor)
                .setDescription(stripIndents`**Track Name:** ${latestTrack.name}
                **Artist(s):** ${latestTrack.artist?.["#text"]}
                **Album:** ${latestTrack.album?.["#text"]}

                **Track Link:** [Click Here](${latestTrack.url})`);

            // Send the mebed
            message.channel.send({ embeds: [embed] });

        } else if (args[0].toLowerCase() == "set") {
            // Special chars regex
            const regex = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;

            // If the username contains a special char, then throw an error
            if (regex.test(args[1]))
                return message.errorReply("Your Last.fm username cannot have any special characters!");

            // Fetch the user from the LastFM API - Catch any errors
            const lfmUser = await getLastFMUser(args[1]).catch(err => message.errorReply(`I ran in to an error setting your username: \`${err.message}\``));

            // If the user exists
            if (lfmUser) {
                // Set the username in the DB
                await users.findOneAndUpdate({ _id: message.author.id }, { lastfm: lfmUser.user.name });
                // Send a confirmation message
                return message.confirmationReply(`I have set your Last.fm name to \`${lfmUser.user.name}\``);
            }
        } else if (args[0].toLowerCase() == "recent") {
            // 1. Fetch the user from Discord
            // 2. Fetch the user from Mongo
            const member = await getMember(message, args[1], true) || await getUser(bot, message, args[1], true),
            user = await users.findOne({ _id: member.id });

            // If there is no valid Discord user, then return an error
            if (!member)
                return message.error("I couldn't find the specified user!");

            // If the user doesn't have a LastFM profile set, then return an error
            if (!user?.lastfm)
                return message.error("That user does not have a Last.fm account linked!");

            // If the user hasn't got a lastfm account present, then return
            const lfmUser = await getLastFMUser(user.lastfm).catch(err => message.errorReply(`I ran in to an error fetching play history from Last.fm: \`${err.message}\``));

            // 1. Fetch the play history from the LastFM API - Catch any errors
            // 2. Re-assign history to be an array of the 10 most recent tracks
            let history = await getLastFMUserHistory(user.lastfm).catch(err => message.errorReply(`I encountered an error getting your play history: ${err}`));
            history = history.recenttracks.track.slice(0, 10);

            // Map each track
            const description = history.map(h => `[${h.name} by ${h.artist["#text"]}](${h.url})`);

            // Create the embed
            const embed = new MessageEmbed()
                .setAuthor(`Listening history for ${user.lastfm}`, lfmUser.user.image[3]?.["#text"])
                .setThumbnail(lfmUser.user.image[3]?.["#text"])
                .setFooter(`Requested by ${message.author.tag}`)
                .setColor(message?.member.displayColor ?? config.general.embedColor)
                .setDescription(description.join("\n"));

            // Send the embed
            message.reply({ embeds: [embed] });
        }
    },

    run_interaction: async (bot, interaction) => {

        // Get the Subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub == "playing") {

            // Defer the reply
            await interaction.deferReply();

            // Fetch the user from the DB
            const userData = await users.findOne({ _id: interaction.user.id });

            // If the user doesn't have a lastfm user account set, then return an error
            if (!userData.lastfm)
                return interaction.editReply({content: `${config.emojis.error} You do not have a Last.fm account set!`});

            // 1. Get the user's history
            // 2. Get the latest track from the play history
            const history = await getLastFMUserHistory(userData.lastfm).catch(err => interaction.editReply({content: `${config.emojis.error} I encountered an error getting your play history: ${err}`})),
            latestTrack = history.recenttracks.track[0];

            // If the latest track doesn't have the nowplayig attr, then return
            if (!latestTrack["@attr"]?.nowplaying)
                return interaction.editReply({content: `${config.emojis.error} It looks like you aren't playing anything right now!`});

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`${latestTrack.name} by ${latestTrack.artist?.["#text"]}`, latestTrack.image[1]["#text"], latestTrack.url)
                .setThumbnail(latestTrack.image[3]["#text"])
                .setColor(interaction?.member.displayColor ?? config.general.embedColor)
                .setDescription(stripIndents`**Track Name:** ${latestTrack.name}
                **Artist(s):** ${latestTrack.artist?.["#text"]}
                **Album:** ${latestTrack.album?.["#text"]}

                **Track Link:** [Click Here](${latestTrack.url})`);

            // Edit the deferral with the embed
            interaction.editReply({ embeds: [embed] });
        } else if (sub == "set") {
            // 1. Fetch the option
            // 2. Fetch the user's data
            const newName = interaction.options.get("username"),
            userData = await users.findOne({ _id: interaction.user.id });

            if (!newName) {
                // If the user doesn't have a lastfm account set, return an error
                if (!userData.lastfm)
                    return interaction.error({ content: "You do not have a Last.fm account set!", ephemeral: true });

                // Send the user's Lastfm account
                return interaction.confirmation({ content: `Your Last.fm account name is currently set to \`${userData.lastfm}\``, ephemeral: true });
            } else {
                // Defer the reply and make it ephemeral
                await interaction.deferReply({ephemeral: true});

                // Define the special chars regex
                const regex = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;

                // If the user's name has a special char, return an error
                if (regex.test(newName.value))
                    return interaction.editReply({content: `${config.emojis.error} Your Last.fm username cannot have any special characters!`});

                // Fetch the user's account from Lastfm, catch any errors
                const lfmUser = await getLastFMUser(newName.value)
                    .catch(err => interaction.editReply({ content: `${config.emojis.error} I ran in to an error setting your username: \`${err.message}\`` }));

                // If the user exists...
                if (lfmUser  && userData) {
                    // Set the account name in the Db
                    await users.findOneAndUpdate({ _id: interaction.user.id }, { lastfm: lfmUser.user.name });
                    // Edit the deferral and confirm the set username
                    return interaction.editReply({content: `${config.emojis.confirmation} I have set your Last.fm name to \`${lfmUser.user.name}\``});
                } else {
                    // If the user doesn't exist in the DB, then create them
                    await users.create({
                        _id: interaction.user.id,
                        lastfm: lfmUser.user.name,
                        track: {
                            usernames: true
                        },
                        usernames: [
                            {
                                username: interaction.user.username,
                                time: Date.now()
                            }
                        ]
                    });
                    // Edit the deferral and confirm the set username
                    return interaction.editReply({content: `${config.emojis.confirmation} I have set your Last.fm name to \`${lfmUser.user.name}\``});
                }
            }
        } else if (sub == "recent") {
            // Defer the reply
            await interaction.deferReply();

            const user = interaction.options.get("user");

            if (user) {
                const userData = await users.findOne({ _id: user.user.id });

                if (!userData?.lastfm)
                    return interaction.editReply({ content: `${config.emojis.error} That user doesn't have a Last.fm account set!` });

                const lfmUser = await getLastFMUser(userData.lastfm).catch(err => interaction.editReply(`${config.emojis.error} I encountered an error getting the Last.fm account for that user: \`${err.message}\``));

                let history = await getLastFMUserHistory(userData.lastfm).catch(err => interaction.editReply(`${config.emojis.error} I encountered an error getting the play history for that user: ${err.message}`));
                history = history.recenttracks.track.slice(0, 10);


                const description = history.map(h => `[${h.name} by ${h.artist["#text"]}](${h.url})`);

                // Create the members embed
                const embed = new MessageEmbed()
                    .setAuthor(`Listening history for ${user.user.tag}`, lfmUser.user.image[3]?.["#text"])
                    .setThumbnail(lfmUser.user.image[3]?.["#text"])
                    .setFooter(`Requested by ${interaction.user.tag}`)
                    .setColor(interaction?.member.displayColor ?? config.general.embedColor)
                    .setDescription(description.join("\n"));

                // Send the members embed
                interaction.editReply({ embeds: [embed] });
            } else {
                const userData = await users.findOne({ _id: interaction.user.id });

                if (!userData?.lastfm)
                    return interaction.editReply({ content: `${config.emojis.error} You do not have a Last.fm account set!` });

                const lfmUser = await getLastFMUser(userData.lastfm).catch(err => interaction.editReply(`${config.emojis.error} I encountered an error getting your Last.fm account: \`${err.message}\``));

                let history = await getLastFMUserHistory(userData.lastfm).catch(err => interaction.editReply(`${config.emojis.error} I encountered an error getting your play history: ${err.message}`));
                history = history.recenttracks.track.slice(0, 10);

                const description = history.map(h => `[${h.name} by ${h.artist["#text"]}](${h.url})`);

                // Create the embed
                const embed = new MessageEmbed()
                    .setAuthor(`Listening history for ${interaction.user.tag}`, lfmUser.user.image[3]?.["#text"])
                    .setThumbnail(lfmUser.user.image[3]?.["#text"])
                    .setFooter(`Requested by ${interaction.user.tag}`)
                    .setColor(interaction?.member.displayColor ?? config.general.embedColor)
                    .setDescription(description.join("\n"));

                // Send the embed
                interaction.editReply({ embeds: [embed] });
            }
        }

    }
};