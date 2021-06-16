const { MessageEmbed } = require("discord.js");
const { getMeme } = require("../../modules/functions/misc");

module.exports = {
    info: {
        name: "meme",
        aliases: [
            "memes",
            "dankmemes",
            "dankmeme"
        ],
        usage: "",
        examples: [],
        description: "Sends a random meme.",
        category: "Fun",
        info: "Memes are taken from the following subreddits: [r/memes](https://www.reddit.com/r/memes), [r/dankmemes](https://www.reddit.com/r/dankmemes), [r/wholesomememes](https://www.reddit.com/r/wholesomememes), [r/BikiniBottomTwitter](https://www.reddit.com/r/BikiniBottomTwitter), [r/funny](https://www.reddit.com/r/funny)",
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: [
            "EMBED_LINKS"
        ]
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
        opts: []
    },

    run: async (bot, message) => {

        // Send a status message & get a random meme
        const msg = await message.loadingReply("Requesting meme..."),
        meme = await getMeme();

        // Build the embed
        const embed = new MessageEmbed()
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setImage(meme.data.url)
            .setDescription(`[${meme.data.title}](https://www.reddit.com/${meme.data.permalink})`)
            .setFooter(meme.data.subreddit_name_prefixed, bot.user.displayAvatarURL({ format: "png", dynamic: true }));

        // Delete the status message & send the embed
        msg.delete().catch(() => {});
        message.reply({ embeds: [embed] });

    },

    run_interaction: async (bot, interaction) => {

        // Defer the interaction
        await interaction.defer();

        // Get a random meme
        const meme = await getMeme();

        // Build the embed
        const embed = new MessageEmbed()
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setImage(meme.data.url)
            .setDescription(`[${meme.data.title}](https://www.reddit.com/${meme.data.permalink})`)
            .setFooter(meme.data.subreddit_name_prefixed, bot.user.displayAvatarURL({ format: "png", dynamic: true }));

        // Send the embed
        interaction.editReply({ embeds: [embed] });

    }
};