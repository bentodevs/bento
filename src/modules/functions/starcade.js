/**
 * Fetches player data from the In-game <-> Discord bridging system
 *
 * @param {String} userId The user to search for
 *
 * @returns {Object} The user data found from the database
 */
exports.getLinkedPlayer = async (bot, userId) => {
    return new Promise((resolve, reject) => {
        bot.mclink.getConnection((err, connection) => {
            // If there is an error, then return
            if (err) {
                bot.logger.error(err);
                return reject(new Error("Connection Error!"));
            }

            // Run the query
            connection.query(`SELECT * FROM stardust_discordlinking WHERE discordId="${userId}"`, (error, results) => {
                if (error) {
                    bot.logger.error(error);
                    reject(new Error("Query Error!"));
                } else if (!results.length) {
                    reject(undefined);
                } else {
                    resolve(results[0]);
                }
            });

            // Close the connection
            connection.release();
        });
    });
};