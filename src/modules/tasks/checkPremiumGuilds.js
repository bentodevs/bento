const premiumGuild = require("../../database/models/premiumGuild");

/**
 * Initialize the checkPremiumGuilds task
 *
 * @param {Object} bot
 */
exports.init = async bot => {
    /**
     * Fetch all premium servers in the DB and action if the subscription has expired
     *
     * @param {Object} bot
     *
     * @returns {Promise<Boolean>} Success/Failure
     */
    const getPremiumServers = async () => {
        // Fetch all active premium servers
        const premiumData = await premiumGuild.find({active: true});

        for await (const data of premiumData) {
            // If the expiry timestamp has passed, then remove premium access
            if (data.expiry !== "forever") {
                if (Date.now() > data.expiry)
                    // Return a removal of premium
                    return await premiumGuild.findOneAndDelete({ _id: data._id });
            }
        }

        return true;
    };

    // Run the getMutes function
    await getPremiumServers(bot);

    // Run the getPremiumServers function every minute
    const interval = setInterval(async () => {
        await getPremiumServers(bot);
    }, 60000);

    // Return the interval info
    return interval;
};