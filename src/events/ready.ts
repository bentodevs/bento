// Import Dependencies
import { ActivityType, Client } from 'discord.js';
import logger from '../logger';
import { registerGlobal } from '../modules/handlers/command.js';
import { init } from '../modules/handlers/task.js';
import { PRESENCE_TEXT } from '../modules/structures/constants';

export default async (bot: Client) => {
    // Send task message and load the tasks
    logger.info('Loading tasks');
    await init(bot);

    // Stop and update the task message
    logger.info('Loaded tasks');

    // Send a spacer
    logger.debug(' ');

    // Set the bots status
    bot.user?.setPresence({ activities: [{ name: PRESENCE_TEXT, type: ActivityType.Watching }], status: 'online' });
    // Register all the slash commands if the bot isn't in a dev environment
    // if (process.env.NODE_ENV !== 'development')
    await registerGlobal(bot);

    // Stop and update the ready message
    logger.info(`Logged into ${bot?.user?.username} - Serving ${bot.guilds.cache.size} guilds`);

    // Send a spacer
    logger.debug(' ');
};
