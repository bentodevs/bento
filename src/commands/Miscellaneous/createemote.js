const { default: fetch } = require("node-fetch");
const path = require("path");

module.exports = {
    info: {
        name: "createemote",
        aliases: ["em", "ce", "createemoji"],
        usage: "createemote [url | emoji | attachment] [name]",
        examples: [
            "createemote :pog: poggers",
            "createemote https://i.imgur.com/H2RlRVJ.gif catjam"
        ],
        description: "Create an emote from a URL, existing emoji or attachment.",
        category: "Miscellaneous",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_EMOJIS",
        type: "discord",
        self: ["MANAGE_EMOJIS"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // If no args were specified & no attachment was added return the help embed
        if (!message.attachments.size && !args[0])
            return bot.commands.get("help").run(bot, message, ["createemote"]);

        // Regex variables
        const emote = /<a?:(\w+):(\d+)>/gi.exec(message.cleanContent),
        url = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi.exec(message.cleanContent);

        // If no emote, url or attachments were found return an error
        if (!emote && !url && !message.attachments.size)
            return message.error("You didn't specify a valid URL, attachment or emote!");

        if (emote) {
            // 1. Prepare the emoji URL
            // 2. Fetch the emoji
            const URL = `https://cdn.discordapp.com/emojis/${emote[2]}${emote[0].startsWith("<a") ? ".gif" : ".png"}`,
            res = await fetch(URL);

            // If the file size is too big return an error
            if (res.headers.get("content-length") > 256 * 1024)
                return message.error("The emoji is too big! It must be 256KB or less.");

            // Convert the emoji to a buffer and grab the emote name
            const buffer = await res.buffer(),
            name = args.join(" ").replace(emote[0], "").trim() ? args.join(" ").replace(emote[0], "").trim() : emote[1];

            // Create the emoji
            message.guild.emojis.create(buffer, name, {
                reason: `Issued by ${message.author.tag} using the createemote command.`
            }).then(emote => {
                message.confirmation(`Successfully created the emote: \`:${emote.name}:\` ${emote}`);
            }).catch(err => {
                message.error(`Failed to create the emote: \`${err}\``);
            });
        } else {
            // Grab the url and fetch the emoji
            const URL = url?.[0] ? url[0] : message.attachments.first().url,
            // TODO: [BOT-4] Create proper function to fetch emojis & fetch through a proxy to stop users from getting the backend IP
            res = await fetch(URL);

            // If the url didn't contain an image return an error
            if (!res.headers.get("content-type").startsWith("image"))
                return message.error("The URL or File you specified isn't an image!");
            // If the size of the file is too big return an error
            if (res.headers.get("content-length") > 256 * 1024)
                return message.error("The emoji is too big! It must be 256KB or less.");

            // Convert the emoji to a buffer and grab the name
            const buffer = await res.buffer(),
            name = args.join(" ").replace(URL, "").trim() ? args.join(" ").replace(URL, "").trim() : path.parse(URL).name;

            console.log(name);

            // Create the emoji
            message.guild.emojis.create(buffer, name, {
                reason: `Issued by ${message.author.tag} using the createemote command.`
            }).then(emote => {
                message.confirmation(`Successfully created the emote: \`:${emote.name}:\` ${emote}`);
            }).catch(err => {
                message.error(`Failed to create the emote: \`${err}\``);
            });
        }

    }
};