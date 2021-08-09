const { Util, MessageEmbed } = require("discord.js");
const { default: fetch } = require("node-fetch");

module.exports = {
    info: {
        name: "lyrics",
        aliases: [],
        usage: "lyrics [song]",
        examples: [
            "lyrics Grindin NF"
        ],
        description: "Fetch song lyrics for your current spotify song, or a specified song",
        category: "Miscellaneous",
        info: null,
        options: []
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
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        const spotifyData = message.member.presence.activities.find(a => a.name.toLowerCase() == "spotify");
        
        if (spotifyData && !args[0]) {

            const req = await fetch(`https://some-random-api.ml/lyrics?title=${spotifyData.details.replace(" ", "+")}+${spotifyData.state.replace(" ", "+")}`),
            res = await req.json();

            if (!res?.lyrics)
                return message.errorReply("I encountered an error fetching lyics for your current song!");
            
            const content = Util.splitMessage(res.lyrics, { maxLength: "1800", char: "\n" });


            for (const data of content) {
                const embed = new MessageEmbed()
                    .setAuthor(`${res.title} by ${res.author}`, res.thumbnail?.genius ?? bot.user.displayAvatarURL({dynamic: true, format: "png"}))
                    .setColor(message.member?.displayColor || bot.config.general.embedColor)
                    .setDescription(`\`\`\`${data}\`\`\``)
                    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
                    .setTimestamp();

                if (data == content[0]) {
                    message.reply({ embeds: [embed] });
                } else {
                    message.channel.send({ embeds: [embed] });
                }
            }

        } else if (args[0]) {
            const req = await fetch(`https://some-random-api.ml/lyrics?title=${args.join("+")}`),
            res = await req.json();

            if (!res?.lyrics)
                return message.errorReply("I encountered an error fetching lyics for your current song!");
            
            const content = Util.splitMessage(res.lyrics, { maxLength: "1800", char: `\n` });

            for (const data of content) {
                const embed = new MessageEmbed()
                    .setAuthor(`${res.title} by ${res.author}`, res.thumbnail?.genius ?? bot.user.displayAvatarURL({dynamic: true, format: "png"}))
                    .setColor(message.member?.displayColor || bot.config.general.embedColor)
                    .setDescription(`\`\`\`${data}\`\`\``)
                    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
                    .setTimestamp();

                if (data == content[0]) {
                    message.reply({ embeds: [embed] });
                } else {
                    message.channel.send({ embeds: [embed] });
                }
            }
        } else {
            message.errorReply("You must be listening to a song, or provide a song to fetch lyrics for!");
        }

    }
};