module.exports = {
    info: {
        name: "ping",
        aliases: ["pong"],
        usage: null,
        examples: [],
        description: "Displays the time between your message and the bots response. Also displays the ping to the Discord API.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message) => {

        // Send a message, once the message is sent edit it with the ping information
        message.channel.send("Never gonna give you up, never gonna let you down...")
            .then(msg => msg.edit(`:ping_pong: **Time:** ${Math.round(msg.createdTimestamp - message.createdTimestamp)} ms\n:heart: **Heartbeat:** ${Math.round(bot.ws.ping)}ms`));

    }
};