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
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message) => {

        // Send a status message & get a random meme
        const msg = await message.loading("Requesting meme..."),
        meme = await getMeme();

        // Build the embed
        const embed = new MessageEmbed()
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setImage(meme.data.url)
            .setDescription(`[${meme.data.title}](https://www.reddit.com/${meme.data.permalink})`)
            .setFooter(meme.data.subreddit_name_prefixed, bot.user.displayAvatarURL({ format: "png", dynamic: true }));

        // Delete the status message & send the embed
        msg.delete().catch(() => {});
        message.channel.send(embed);

    }
};