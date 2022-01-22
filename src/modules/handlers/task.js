import { Collection } from 'discord.js';
import { readdirSync } from 'fs';

export const init = (bot) => new Promise((resolve) => {
    // Create the tasks collection
    // eslint-disable-next-line no-param-reassign
    bot.tasks = new Collection();

    // Get the task files
    const files = readdirSync('./src/modules/tasks').filter((file) => file.endsWith('.js'));

    // Loop through the files
    for (const data of files) {
        import(`../tasks/${data}`).then((task) => {
            task.default(bot).then((interval) => {
                bot.tasks.set(data.split('.')[0], interval);
            });
        }).catch((err) => {
            // Log the error
            bot.logger.error(`Failed to load ${data}`);
            bot.logger.error(err.stack);
        });
    }

    resolve(files.length);
});

/**
 * Reload a task
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} task The name of the task to reload
 *
 * @returns {Promise<String>} Returns the task name if the task reloaded successfully
 */
export const reload = (bot, task) => new Promise((resolve, reject) => {
    // Get all the task files and get the specified task
    const files = readdirSync('./src/modules/tasks').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${task.toLowerCase()}.js`);

    // If no file was found return an error
    if (!file) reject(new Error('Task not found'));

    // Get the task name
    const taskName = file.split('.')[0];

    // Stop the setInterval function
    clearInterval(bot.tasks.get(taskName));
    // Delete the task from cache
    delete require.cache[require.resolve(`../tasks/${file}`)];
    // Delete the task from the collection
    bot.tasks.delete(taskName);

    import(`../tasks/${file}`).then((module) => {
        module.default(bot).then((interval) => {
            bot.tasks.set(taskName, interval);
        });

        // Return the task name
        resolve(taskName);
    }).catch((err) => {
        // Log the error
        bot.logger.error(`Failed to load ${taskName}`);
        bot.logger.error(err.stack);

        // Return the error
        reject(err);
    });
});

/**
 * Load a task
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} task The name of the task to load
 *
 * @returns {Promise<String>} Returns the task name if the task loaded successfully
 */
export const load = (bot, task) => new Promise((resolve, reject) => {
    // Get all the task files and get the specified task
    const files = readdirSync('./src/modules/tasks').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${task.toLowerCase()}.js`);

    // If the task wasn't found return an error
    if (!file) reject(new Error('Task not found'));

    // Get the task name
    const taskName = file.split('.')[0];

    // If the task is already loaded return an error
    if (bot.tasks.get(taskName)) reject(new Error('Task is already loaded'));

    import(`../tasks/${file}`).then((module) => {
        module.default(bot).then((interval) => {
            bot.tasks.set(taskName, interval);
        });

        // Return the task name
        resolve(taskName);
    }).catch((err) => {
        // Log the error
        bot.logger.error(`Failed to load ${taskName}`);
        bot.logger.error(err.stack);

        // Reject the error
        reject(err);
    });
});

/**
 * Unload a task
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} task The name of the task to unload
 *
 * @returns {Promise<String>} Returns the task name if the task unloaded successfully
 */
export const unload = (bot, task) => new Promise((resolve, reject) => {
    // Get all the task files and get the specified task
    const files = readdirSync('./modules/tasks').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${task.toLowerCase()}.js`);

    // If the task wasn't found return an error
    if (!file) reject(new Error('Task not found'));

    try {
        // Get the task name
        const taskName = file.split('.')[0];

        // If the task is already loaded return an error
        if (!bot.tasks.get(taskName)) reject(new Error("Task isn't loaded"));

        // Stop the setInterval function
        clearInterval(bot.tasks.get(taskName));
        // Delete the task from cache
        delete require.cache[require.resolve(`../tasks/${file}`)];
        // Delete the task from the collection
        bot.tasks.delete(taskName);

        // Return the task name
        resolve(taskName);
    } catch (err) {
        // Log the error
        bot.logger.error(`Failed to unload ${file}`);
        bot.logger.error(err.stack);
        // Reject with the error
        reject(err);
    }
});
