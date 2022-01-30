import Sentry from '@sentry/node';
import fetch from 'node-fetch';

/**
 * Initialise the publishTopGGStats task
 *
 * @param {Object} bot
 */
export default async function init(bot) {
    /**
     * Fetch all guilds
     *
     * @param {Object} bot
    */

    const getAndPublishGuildCount = async () => {
        // Get all guilds
        const guilds = await bot.guilds.fetch({ limit: 200 });

        // Get the guild count
        const guildCount = guilds.size;

        // Define the URL
        const url = `https://top.gg/api/bots/${bot.user.id}/stats`;
        // Define the request body
        const reqBody = {
            server_count: guildCount,
        };
        // Define request headers
        const reqHeaders = {
            Authorization: process.env.TOPGG_TOKEN,
        };

        fetch(url, {
            method: 'POST',
            headers: reqHeaders,
            body: JSON.stringify(reqBody),
        }).then((res) => {
            if (res.status === 200) bot.logger.info('Posted guild count statistics to Top.GG successfully');
        }).catch((err) => {
            bot.logger.error(err);
            Sentry.captureException(err);
        });

        return true;
    };

    // Do not run the function if in dev environment
    if (process.env.NODE_ENV === 'production') await getAndPublishGuildCount(bot);

    // Run the getAndPublishGuildCount function every hour
    const interval = setInterval(async () => {
        if (process.env.NODE_ENV === 'production') {
            await getAndPublishGuildCount(bot);
        } else {
            bot.logger.debug('Not posting guild count statistics to Top.GG due to a non-production environment');
        }
    }, 3600000);

    // Return the interval info
    return interval;
}
