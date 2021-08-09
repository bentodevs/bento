const { getMember } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "clean",
        aliases: [],
        usage: "clean [user]",
        examples: ["clean Jarno"],
        description: "Cleans recent messages from a user",
        category: "Moderation",
        info: "If you don't specify a user it will default to the bot",
        options: []
    },
    perms: {
        permission: "MANAGE_MESSAGES",
        type: "discord",
        self: ["MANAGE_MESSAGES"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the member
        let member = await getMember(message, args.join(" "));

        // If there were no args provided, then set the member as the bot
        if (!args[0])
            member = bot.user;
        
        // If the member doesn't exist, return an error
        if (!member)
            return message.errorReply("You did not specify a valid user!");
        
        // Fetch the last 100 messages from the user
        const messages = await message.channel.messages.fetch({ limit: 100 });

        // Delete the messages previously gathered
        await message.channel.bulkDelete(messages.filter(m => m.author.id === member.id)).catch(e => message.errorReply(`There was an issue cleaning messages - \`${e.message}\``));

        // Delete the command
        message.delete().catch(() => { });
        
    }
};