const { MessageEmbed } = require("discord.js");

module.exports = {
    info: {
        name: "poll",
        aliases: [
            "createpoll"
        ],
        usage: "poll [channel] <question | options>",
        examples: [
            "poll #polls ban waitrose? | yes | no",
            "poll unban waitrose ? | yes | no"
        ],
        description: "Create a poll which you can vote on with reactions.",
        category: "Miscellaneous",
        info: "Use `|` to sperate options. You can add up to 10 options.",
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
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Channel Var
        let channel = message.channel;

        // If a channel was mentioned set it as the channel
        if (message.mentions?.channels?.size > 0) { 
            args = args.slice(1); 
            channel = message.mentions?.channels.first(); 
        }

        // If the channel isn't a text or news channel return an error
        if (channel.type !== "text" && channel.type !== "news")
            return message.error("The channel you mentioned isn't a text or news channel!");
        // If the user doesn't have MANAGE_MESSAGES permission but specified a different channel return an error
        if (channel.id !== message.channel.id && !message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS"))
            return message.error("To send polls to different channels you need the `MANAGE_CHANNELS` permission!");
        // If the user can't send messages in the specified channel return an error
        if (!channel.permissionsFor(message.member).has("SEND_MESSAGES"))
            return message.error("You don't have permissions to send messages in that channel!");

        // Poll Vars
        const poll = args.join(" ").split("|"),
        question = poll[0],
        choices = poll.splice(1);

        // If no choices were specified return an error
        if (choices.length <= 0)
            return message.error("You didn't specify any options!");
        // If more than 10 choices were specified return an error
        if (choices.length > 10)
            return message.error("YOu cannot specify more than 10 options!");
        // If the choices are the same return an error
        if (choices.every((val, i, arr) => val.trim() === arr[0].trim()))
            return message.error("You should at least give them a choice 🤔");

        // Define all the emotes
        const emotes = {
            1: "🇦",
            2: "🇧",
            3: "🇨",
            4: "🇩",
            5: "🇪",
            6: "🇫",
            7: "🇬",
            8: "🇭",
            9: "🇮",
            10: "🇯"
        };

        // Define the msg var
        let msg = `${bot.config.emojis.poll} ${question.trim()}\n\n**React to this message to vote**\n\n`;

        // Loop through the choices and add them to the msg
        choices.forEach((choice, index) => {
            msg += `${emotes[index + 1]} - ${choice.trim()}\n`;
        });

        // Build the embed
        const embed = new MessageEmbed()
            .setThumbnail("https://i.imgur.com/6DbXHMG.png")
            .setDescription(msg)
            .setFooter(`Started by: ${message.author.tag}`)
            .setTimestamp()
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        const eMsg = await channel.send(embed);

        // If the embed was send to a different channel send a confirmation message
        if (channel.id !== message.channel.id)
            message.confirmation(`The poll has successfully been set to ${channel}!`);

        // Loop through the choices and add the reactions
        choices.forEach(async (data, index) => {
            await eMsg.react(emotes[index + 1]);
        });
        
    }
};