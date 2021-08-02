const { stripIndents } = require("common-tags");

module.exports = {
    info: {
        name: "leave",
        aliases: [
            "leaveserver"
        ],
        usage: "leave <guild id | \"this\">",
        examples: [
            "leave this",
            "leave 839939523231875082"
        ],
        description: "Force leaves a discord.",
        category: "Dev",
        info: null,
        options: []
    },
    perms: {
        type: "dev",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: true,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the guild
        const guild = args[0].toLowerCase() == "this" ? message.guild ?? null : await bot.guilds.fetch(args[0]).catch(() => {});

        // If the guild wasn't found return an error
        if (!guild)
            return message.errorReply("You didn't specify a valid guild!");

        // Send a message asking if the user is sure
        await message.reply(stripIndents`Are you sure you want me to leave \`${guild.name} (${guild.id})\`?
        
        Type \`y\` or \`yes\` to continue.`);

        // Define the filter and options
        const filter = m => m.author.id == message.author.id,
        options = { time: 60000, max: 1, errors: ["time"] };

        // Await a response
        await message.channel.awaitMessages(filter, options).then(async msgs => {
            // Get the first response
            const m = msgs.first();

            // If the user typed "y" or "yes" leave the discord otherwise send the canceled message
            if (["y", "yes"].includes(m.content.toLowerCase())) {
                await guild.leave();
                
                if (guild.id == message.guild.id) {
                    message.author.send(`${bot.config.emojis.confirmation} Successfully left \`${guild.name} (${guild.id})\`!`);
                } else {
                    message.confirmationReply(`Successfully left \`${guild.name} (${guild.id})\`!`);
                }
            } else {
                message.confirmationReply("The command has been canceled.");
            }
        }).catch(() => {
            // Send an error message
            message.errorReply("The command has been canceled.");
        });

    }
};