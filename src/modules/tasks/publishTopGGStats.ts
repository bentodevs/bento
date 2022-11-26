import * as Sentry from '@sentry/node';
import { Client } from 'discord.js';
import { request } from 'undici';
import logger from '../../logger';

/**
 * Initialise the publishTopGGStats task
 *
 * @param {Object} bot
 */
export default async function init(bot: Client): Promise<NodeJS.Timer> {
    const getAndPublishGuildCount = async (bot: Client) => {
        // Get all guilds
        const guilds = await bot.guilds.fetch({ limit: 200 });

        // Get the guild count
        const guildCount = guilds.size;

        // Define the URL
        const url = `https://top.gg/api/bots/${bot?.user?.id}/stats`;
        // Define the request body
        const reqBody = {
            server_count: guildCount,
        };
        // Define request headers
        const reqHeaders = {
            Authorization: process.env.TOPGG_TOKEN,
        };

        request(url, {
            method: 'POST',
            headers: reqHeaders,
            body: JSON.stringify(reqBody),
        }).then((res) => {
            if (res.statusCode === 200) logger.debug('Posted guild count statistics to Top.GG successfully');
        }).catch((err: Error) => {
            logger.error(err);
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
            logger.debug('Not posting guild count statistics to Top.GG due to a non-production environment');
        }
    }, 3600000);

    // Return the interval info
    return interval;
}
