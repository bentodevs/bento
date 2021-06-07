module.exports = {
    info: {
        name: "invite",
        aliases: ["createinvite", "inv"],
        usage: "",
        examples: [],
        description: "Creates a permanent guild invite.",
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

    run: async (bot, message) => {

        if (message.guild.vanityURLCode) {
            // If the guild has a vanity URL send it
            message.channel.send(`https://discord.gg/${message.guild.vanityURLCode}`);
        } else {
            // Create a permanent invite and send it
            message.channel.createInvite({ maxAge: 0 }).then(invite => {
                message.channel.send(invite.toString());
            }).catch(err => {
                message.error(`Something went wrong while creating the invite: \`${err.message}\``);
            });
        }

    }
};