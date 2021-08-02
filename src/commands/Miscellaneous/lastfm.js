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
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        if (!args[0]) {
            const userData = await users.findOne({ _id: message.author.id });

            if (!userData.lastfm)
                return message.errorReply(`You do not have a Last.fm account set! Set one with \`${message.settings.general.prefix}lastfm set <username>\``);
            
            const history = await getLastFMUserHistory(userData.lastfm).catch(err => message.errorReply(`I encountered an error getting your play history: ${err}`)),
                latestTrack = history.recenttracks.track[0];

            if (!latestTrack?.["@attr"].nowplaying)
                return message.errorReply("It looks like you aren't playing anything right now!");
            
            const embed = new MessageEmbed()
                .setAuthor(`${latestTrack.name} by ${latestTrack.artist?.["#text"]}`, latestTrack.image[1]["#text"], latestTrack.url)
                .setThumbnail(latestTrack.image[3]["#text"])
                .setColor(message?.member.displayColor ?? config.general.embedColor)
                .setDescription(stripIndents`**Track Name:** ${latestTrack.name}
                **Artist(s):** ${latestTrack.artist?.["#text"]}
                **Album:** ${latestTrack.album?.["#text"]}
                
                **Track Link:** [Click Here](${latestTrack.url})`);
            
            message.channel.send({ embeds: [embed] });

        } else if (args[0].toLowerCase() == "set") {
            const regex = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;

            if (regex.test(args[1]))
                return message.errorReply("Your Last.fm username cannot have any special characters!");
            
            const lfmUser = await getLastFMUser(args[1]).catch(err => message.errorReply(`I ran in to an error setting your username: \`${err.message}\``));

            if (lfmUser) {
                await users.findOneAndUpdate({ _id: message.author.id }, { lastfm: lfmUser.user.name });
                return message.confirmationReply(`I have set your Last.fm name to \`${lfmUser.user.name}\``);
            }
        } else if (args[0].toLowerCase() == "recent") {
            const member = await getMember(message, args[1], true) || await getUser(bot, message, args[1], true),
                user = await users.findOne({ _id: member.id });
            
            if (!member)
                return message.error("I couldn't find the specified user!");
            
            if (!user?.lastfm)
                return message.error("That user does not have a Last.fm account linked!");
            
            const lfmUser = await getLastFMUser(user.lastfm).catch(err => message.errorReply(`I ran in to an error setting your username: \`${err.message}\``));
            
            let history = await getLastFMUserHistory(user.lastfm).catch(err => message.errorReply(`I encountered an error getting your play history: ${err}`));
                history = history.recenttracks.track.slice(0, 10);
            
            const description = history.map(h => `[${h.name} by ${h.artist["#text"]}](${h.url})`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor(`Listening history for ${user.lastfm}`, lfmUser.user.image[3]?.["#text"])
                .setThumbnail(lfmUser.user.image[3]?.["#text"])    
                .setFooter(`Requested by ${message.author.tag}`)
                .setColor(message?.member.displayColor ?? config.general.embedColor)
                .setDescription(description.join("\n"));
        
            // Send the members embed
            message.reply({ embeds: [embed] });
        }
    }
};