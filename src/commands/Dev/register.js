const { registerGuild } = require("../../modules/handlers/command");

module.exports = {
    info: {
        name: "register",
        aliases: [],
        usage: "",
        examples: [],
        description: "",
        category: "Dev",
        info: null,
        options: []
    },
    perms: {
        permission: "",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: true,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        await registerGuild(bot, message.guild.id)
            .then(() => message.confirmationReply("Successfully registered that command!"))
            .catch((err) => message.errorReply(`\`\`\`x1\n${err}\`\`\``));

    }
};