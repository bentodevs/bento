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
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "channel",
            type: "CHANNEL",
            description: "Specify the channel you want to host the poll in.",
            required: true
        }, {
            name: "question",
            type: "STRING",
            description: "The question you want to ask with the poll.",
            required: true
        }, {
            name: "option_1",
            type: "STRING",
            description: "The first option of the poll.",
            required: true
        }, {
            name: "option_2",
            type: "STRING",
            description: "The second option of the poll.",
            required: true
        }, {
            name: "option_3",
            type: "STRING",
            description: "The third option of the poll.",
            required: false
        }, {
            name: "option_4",
            type: "STRING",
            description: "The fourth option of the poll.",
            required: false
        }, {
            name: "option_5",
            type: "STRING",
            description: "The fifth option of the poll.",
            required: false
        }, {
            name: "option_6",
            type: "STRING",
            description: "The sixth option of the poll.",
            required: false
        }, {
            name: "option_7",
            type: "STRING",
            description: "The seventh option of the poll.",
            required: false
        }, {
            name: "option_8",
            type: "STRING",
            description: "The eigth option of the poll.",
            required: false
        }, {
            name: "option_9",
            type: "STRING",
            description: "The ninth option of the poll.",
            required: false
        }, {
            name: "option_10",
            type: "STRING",
            description: "The tenth option of the poll.",
            required: false
        }]
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
        const eMsg = await channel.send({ embeds: [embed] });

        // If the embed was send to a different channel send a confirmation message
        if (channel.id !== message.channel.id)
            message.confirmation(`The poll has successfully been set to ${channel}!`);

        // Loop through the choices and add the reactions
        choices.forEach(async (data, index) => {
            await eMsg.react(emotes[index + 1]);
        });
        
    },

    run_interaction: async (bot, interaction) => {

        // Get the channel
        const channel = interaction.options.get("channel").channel;

        // If the channel isn't a text or news channel return an error
        if (channel.type !== "text" && channel.type !== "news")
            return interaction.error("The channel you specified isn't a text or news channel!");
        // If the user doesn't have MANAGE_MESSAGES permission but specified a different channel return an error
        if (channel.id !== interaction.channel.id && !interaction.channel.permissionsFor(interaction.member).has("MANAGE_CHANNELS"))
            return interaction.error("To send polls to different channels you need the `MANAGE_CHANNELS` permission!");
        // If the user can't send messages in the specified channel return an error
        if (!channel.permissionsFor(interaction.member).has("SEND_MESSAGES"))
            return interaction.error("You don't have permissions to send messages in that channel!");

        const question = interaction.options.get("question").value,
        choices = interaction.options.filter(a => a.name.startsWith("option")).map(a => a.value);

        // If the choices are the same return an error
        if (choices.every((val, i, arr) => val.trim() === arr[0].trim()))
            return interaction.error("You should at least give them a choice 🤔");

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
            .setFooter(`Started by: ${interaction.user.tag}`)
            .setTimestamp()
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        const eMsg = await channel.send({ embeds: [embed] });

        // Send a confirmation message
        interaction.confirmation(`The poll has successfully been started in ${channel}!`, { ephemeral: true });

        // Loop through the choices and add the reactions
        choices.forEach(async (data, index) => {
            await eMsg.react(emotes[index + 1]);
        });

    }
};