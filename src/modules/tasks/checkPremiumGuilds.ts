import premiumGuild from '../../database/models/premiumGuild';

/**
 * Initialize the checkPremiumGuilds task
 */
export default async function init(): Promise<NodeJS.Timer> {
    /**
     * Fetch all premium servers in the DB and action if the subscription has expired
     *
     * @returns {Promise<Boolean>} Success/Failure
     */
    const getPremiumServers = async () => {
        // Fetch all active premium servers
        const premiumData = await premiumGuild.find({ active: true });

        for await (const data of premiumData) {
            // If the expiry timestamp has passed, then remove premium access
            if (data.expiry !== -1) {
                if (Date.now() > data.expiry) {
                    // Return a removal of premium
                    // eslint-disable-next-line no-underscore-dangle
                    await premiumGuild.findOneAndDelete({ _id: data._id });
                    return;
                }
            }
        }

        return true;
    };

    // Run the getMutes function
    await getPremiumServers();

    // Run the getPremiumServers function every minute
    const interval = setInterval(async () => {
        await getPremiumServers();
    }, 60000);

    // Return the interval info
    return interval;
}
