const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "base64",
        aliases: ["b64"],
        usage: "base64 <\"encode\" | \"decode\"> <text>",
        examples: [
            "base64 encode kek, jarno bald"
        ],
        description: "Encodes or decodes text in [Base64](https://en.wikipedia.org/wiki/Base64)",
        category: "Text Tools",
        info: null,
        options: [
            "`encode` - Encode a string to Base64",
            "`decode` - Decode a Base64 sring"
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
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {
        if (args[0].toLowerCase() === "encode") {
            const string = args.splice(1).join(" "),
                encoded = Buffer.from(string).toString('base64');
            
            const embed = new MessageEmbed()
                .setAuthor("Base64 encoded string", "https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1")
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(`\`\`\`${encoded}\`\`\``);
            
            message.reply({ embeds: [embed] });
        } else if (args[0].toLowerCase() === "decode") {
            const string = args[1],
                encoded = Buffer.from(string, 'base64').toString();
            
            const embed = new MessageEmbed()
                .setAuthor("Base64 decoded string", "https://cdn.discordapp.com/emojis/774154612139622410.gif?v=1")
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(`\`\`\`${encoded}\`\`\``);
            
            message.reply({ embeds: [embed] });
        } else {
            message.errorReply("You must specify either `encode` or `decode`");
        }
    }
};