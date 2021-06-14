const { MessageEmbed } = require("discord.js");
const { urban } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "urbandictionary",
        aliases: [
            "ud",
            "urban"
        ],
        usage: "urbandictionary <query>",
        examples: [
            "urbandictionary lol",
            "urbandictionary weeb"
        ],
        description: "Search for things on the Urban Dictionary.",
        category: "Fun",
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
        enabled: true,
        opts: []
    },

    run: async (bot, message, args) => {

        // Send a status message and get the definition
        const msg = await message.loading("Fetching definition..."),
        result = await urban(args.join(" "));

        // Send a error message if no definition was found
        if (!result)
            return msg.edit(`${bot.config.emojis.error} I couldn't find any definitions for that!`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Urban Dictionary: ${result.word}`, "https://i.imgur.com/kwkO5eD.jpg", result.permalink)
            .setThumbnail("https://i.imgur.com/kwkO5eD.jpg")
            .setDescription(`${result.definition.length >= 2000 ? `Definition is too large to display in a message. [Click here](${result.permalink}) to view it on the site.` : result.definition}\n\n${result.example}\n\n👍 ${result.thumbs_up} 👎 ${result.thumbs_down} | [See all results](https://www.urbandictionary.com/define.php?term=${args.join("_")})`)
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed and delete the status message
        message.channel.send({ embeds: [embed] });
        msg.delete().catch(() => {});

    },

    run_interaction: async (bot, interaction) => {

        // Defer the interaction
        await interaction.defer();

        // Get the definition
        const result = await urban(interaction.options.get("query").value);

        // Send a error message if no definition was found
        if (!result)
            return interaction.editReply(`${bot.config.emojis.error} I couldn't find any definitions for that!`);

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Urban Dictionary: ${result.word}`, "https://i.imgur.com/kwkO5eD.jpg", result.permalink)
            .setThumbnail("https://i.imgur.com/kwkO5eD.jpg")
            .setDescription(`${result.definition.length >= 2000 ? `Definition is too large to display in a message. [Click here](${result.permalink}) to view it on the site.` : result.definition}\n\n${result.example}\n\n👍 ${result.thumbs_up} 👎 ${result.thumbs_down} | [See all results](https://www.urbandictionary.com/define.php?term=${interaction.options.get("query").value.split(" ").join("_")})`)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        interaction.editReply({ embeds: [embed] });

    }
};