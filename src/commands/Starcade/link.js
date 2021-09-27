module.exports = {
    info: {
        name: "link",
        aliases: [],
        usage: "link <code>",
        examples: [
            "link 123456"
        ],
        description: "Link your Discord account to your Minecraft IGN",
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

        // Grab the specified code
        const code = parseInt(args[0]);

        // If the user specified an invalid code return an error
        if (!code)
            return message.errorReply("The code that you provided is not numeric!");

        bot.mclink.getConnection((err, conn) => {
            // If something went wrong return an error
            if (err)
                return message.errorReply("An error occurred while connecting to the database! Please contact an admin if this issue persists.");

            conn.query(`SELECT * FROM discordlink WHERE discordId='${message.author.id}'`, (err, results) => {
                // If something went wrong return an error
                if (err) {
                    return message.errorReply("An error occurred while trying to link your account! Please contact an admin if this issue persists.");
                } else if (!results.length) {
                    conn.query(`SELECT * FROM discordlink WHERE code=${code}`, async (err, results) => {
                        if (err) {
                            // Send an error message
                            return message.errorReply("An error occurred while trying to link your account! Please contact an admin if this issue persists.");
                        } else if (!results.length) {
                            // Send an error message
                            message.error("You didn't specify a valid code!");
                        } else {
                            if (results[0].discordId !== "-1") {
                                // Send an error message
                                message.errorReply("The code you specified is already linked another user!");
                            } else {
                                try {
                                    // Update the database
                                    await conn.query(`UPDATE discordlink SET discordId='${message.author.id}', boosting=${message.member.premiumSinceTimestamp ? 1 : 0} WHERE code=${code}`);

                                    // Send a rabbit message
                                    await bot.rabbit.publish("MESSENGER", "", Buffer.from(JSON.stringify({
                                        channel: "DISCORD_LINK",
                                        server: "discord_bot",
                                        message: `LINK_SUCCESS:${code}`
                                    })));

                                    // Send a confirmation message
                                    message.confirmationReply(`Your Discord account has been linked to \`${results[0].username}\`!`);
                                } catch (err) {
                                    // Send an error message if something went wrong
                                    message.errorReply("An error occurred while trying to link your account! Please contact an admin if this issue persists.");
                                    // Log the error
                                    console.error(err);
                                }
                            }
                        }
                    });
                } else {
                    // Send an error message
                    message.error("Your account is already linked!");
                }
            });

            // Release the connection
            conn.release();
        });
    }
};