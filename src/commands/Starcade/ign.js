const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "ign",
        aliases: ["viewign"],
        usage: "ign [user]",
        examples: [
            "ign @Waitrose"
        ],
        description: "Fetch the linked Minecraft IGN for a user, or yourself",
        category: "Starcade",
        info: null,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: true
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        // Get the requested user
        const user = await getMember(message, args.join(" "), false) || await getUser(bot, message, args.join(" "), false);

        if (!user)
            return message.errorReply("You didn't specify a valid user!");

        // Fetch a connection from the connection pool
        bot.mclink.getConnection((err, conn) => {
            // If error, then send an error
            if (err)
                return message.errorReply("An error occurred while connecting to the database! Please contact an admin if this issue persists.");

            // Select the entire reow where the Discord ID matches what is returned by the find function
            conn.query(`SELECT * FROM discordlink WHERE discordId='${user.id}'`, async (err1, data) => {
                // If there's some error, then catch it, log it and tell the user
                if (err1) {
                    // Send generic user error
                    message.errorReply("An error occurred while getting results from the database! Please contact an admin if this issue persists.");
                    // Send error to console
                    return bot.logger.error(err1);
                }

                if (!data.length)
                    return message.errorReply("There is no IGN associated with that account!");

                if (data.length) {
                    // Send a confirmation message
                    message.confirmationReply(`The IGN for \`${user?.user?.tag ?? `${user.username}#${user.discriminator}`}\` is linked to \`${data[0].username}\``);
                }
            });

            // Release the connection back to the pool
            conn.release();
        });
    }
};