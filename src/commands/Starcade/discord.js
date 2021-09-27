const { getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "discord",
        aliases: [],
        usage: "discord <IGN>",
        examples: [
            "discord Forgetfully"
        ],
        description: "Fetch the Discord account associated with an IGN",
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
        noArgsHelp: true,
        disabled: true
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        // Fetch a connection from the connection pool
        bot.mclink.getConnection((err, conn) => {
            // If error, then send an error
            if (err)
                return message.errorReply("An error occurred while connecting to the database! Please contact an admin if this issue persists.");

            // Select the entire reow where the Discord ID matches what is returned by the find function
            conn.query(`SELECT * FROM discordlink WHERE username='${args[0]}'`, async (err, data) => {
                // If there's some error, then catch it, log it and tell the user
                if (err) {
                    // Send generic user error
                    message.errorReply("An error occurred while getting results from the database! Please contact an admin if this issue persists.");
                    // Send error to console
                    return bot.logger.error(err);
                }

                if (!data.length || data[0]?.discordID === "-1")
                    return message.errorReply("No user was found with the provided username, or there is no associated Discord account!");

                if (data.length) {
                    // Fetch the user from Discord
                    const user = await getUser(bot, message, data[0].discordID, false);
                    // Send a confirmation message
                    message.confirmationReply(`\`${args[0]}\` is linked in \`${user.tag}\` (\`${user.id}\`)`);
                }
            });

            // Release the connection back to the pool
            conn.release();
        });
    }
};