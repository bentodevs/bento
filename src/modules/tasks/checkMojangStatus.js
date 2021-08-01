const { default: fetch } = require("node-fetch");

/**
 * Initialize the checkMojangStatus task
 * 
 * @param {Object} bot 
 */
exports.init = async bot => {
    /**
     * Fetch the current mojang status and update bot.mojang
     * 
     * @param {Object} bot 
     * 
     * @returns {Promise<Boolean>} Success/Failure
     */
    const getStatus = (bot) => {
        return new Promise((resolve) => {
            fetch("https://status.mojang.com/check").then(res => res.json()).then(json => {
                // Set the mojang data
                bot.mojang = {
                    status: json,
                    lastUpdated: Date.now()
                };

                // Resolve true
                resolve(true);
            }).catch(err => {
                resolve(false);
                bot.logger.warn(err.message);
            });
        });
    };

    // Run the getStatus function
    await getStatus(bot);

    // Run the getStatus function every minute
    const interval = setInterval(async () => {
        await getStatus(bot);
    }, 60000);

    // Return the interval info
    return interval;
};