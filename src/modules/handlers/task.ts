import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { tasks } from '../../bot';
import logger from '../../logger';

// eslint-disable-next-line import/prefer-default-export
export const init = (bot: Client) => new Promise((resolve) => {
    // Get the task files
    const files = readdirSync('./modules/tasks').filter((file) => file.endsWith('.js'));

    // Loop through the files
    for (const data of files) {
        import(`../tasks/${data}`).then((task) => {
            task.default(bot).then((interval) => {
                tasks.set(data.split('.')[0], interval);
            });
        }).catch((err) => {
            // Log the error
            logger.error(`Failed to load ${data}`);
            logger.error(err.stack);
        });
    }

    resolve(files.length);
});
