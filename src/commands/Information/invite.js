module.exports = {
    info: {
        name: "invite",
        aliases: ["createinvite", "inv"],
        usage: "",
        examples: [],
        description: "Creates a permanent guild invite. (or sends an existing one)",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: "CREATE_INSTANT_INVITE",
        type: "discord",
        self: ["CREATE_INSTANT_INVITE"]
    },
    opts: {
        guildOnly: true,
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

        if (message.guild.vanityURLCode) {
            // If the guild has a vanity URL send it
            message.reply(`https://discord.gg/${message.guild.vanityURLCode}`);
        } else {
            // Create a permanent invite and send it
            message.channel.createInvite({ maxAge: 0 }).then(invite => {
                message.reply(invite.toString());
            }).catch(err => {
                message.errorReply(`Something went wrong while creating the invite: \`${err.message}\``);
            });
        }

    }
};