const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "unlink",
        aliases: [],
        usage: "unlink <user>",
        examples: [
            "unlink @waitrose"
        ],
        description: "Unlink a Discord account from a Minecraft account",
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

        // Get the requested user
        const user = await getMember(message, args.join(" "), false) || await getUser(bot, message, args.join(" "), false);

        bot.mclink.getConnection(function (err, connection) {
            // If error, then send error message & log it
            if (err)
                return message.error("An error was encountered unlinking that Discord ID, please contact Jarno or Waitrose!") && bot.logger.error(err);

            connection.query(`SELECT username, code, discordId, uuid FROM discordlink WHERE discordId='${user.id}'`,
                function (error, results) {
                    // If error, then send error message & log it
                    if (error) {
                        bot.logger.error(error);
                        message.error("An error was encountered getting the IGN for that user, please contact Jarno or Waitrose!");
                    } else if (results.length <= 0) {
                        // If the user isn't linked, then send an error message
                        message.error("That user does not appear to have an In-Game account linked to Discord");
                    } else if (results.length >= 1) {
                        try {
                            // 1. Update discordID to '-1' so that it can be relinked
                            // 2. Send confirmation message
                            connection.query(`UPDATE discordlink SET discordId='-1' WHERE uuid='${results[0].uuid}'`);
                            message.confirmation(`The IGN \`${results[0].username}\` has been unlinked from any Discord account`);
                        } catch (error) {
                            message.error(`An error was encountered unlinking the IGN for that user, please contact Jarno or Waitrose!`);
                            bot.logger.error(error.stack);
                        }
                    }
                }
            );

            // Release the connection
            connection.release();
        });
    }
};