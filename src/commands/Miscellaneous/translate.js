const translate = require("@vitalets/google-translate-api");
const ISO = require("iso-639-1");
const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "translate",
        aliases: [
            "tl",
        ],
        usage: "translate [destination language] <text>",
        examples: [
            "translate german Hi, I am Jarno",
            "translate Hallo, ich bin Jarno"
        ],
        description: "Translates text to a certain laguage.",
        category: "Miscellaneous",
        info: "Translates to English if no language or a invalid language was specified.",
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
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the language and the text to translate
        const language = translate.languages[args[0].toLowerCase()] || Object.values(translate.languages).find(a => typeof(a) == "string" ? a.toLowerCase() == args[0].toLowerCase() : ""),
        toTranslate = language ? args.slice(1).join(" ") : args.join(" ");

        // Translate the text
        const result = await translate(toTranslate, {
            to: language ?? "en"
        });

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Translated From: ${ISO.getName(result.from.language.iso)}`)
            .setThumbnail("https://i.imgur.com/Lg3ZDtn.png")
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .addField(`Original (${ISO.getName(result.from.language.iso)})`, toTranslate)
            .addField(`Translated (${translate.languages[language] ? ISO.getName(language) : language ?? "English"})`, result.text);

        // Send the embed
        message.channel.send(embed);

    }
};