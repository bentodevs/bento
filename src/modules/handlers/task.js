const { Collection } = require('discord.js');
const { readdirSync } = require('fs');

exports.init = (bot) => new Promise((resolve) => {
    // Create the tasks collection
    // eslint-disable-next-line no-param-reassign
    bot.tasks = new Collection();

    // Get the task files
    const files = readdirSync('./modules/tasks').filter((file) => file.endsWith('.js'));

    // Loop through the files
    for (const data of files) {
        try {
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const { init } = require(`../tasks/${data}`);

            init(bot).then((interval) => {
                bot.tasks.set(data.split('.')[0], interval);
            });
        } catch (err) {
            // Log the error
            bot.logger.error(`Failed to reload ${data}`);
            bot.logger.error(err.stack);
        }
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
exports.reload = (bot, task) => new Promise((resolve, reject) => {
    // Get all the task files and get the specified task
    const files = readdirSync('./modules/tasks').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${task.toLowerCase()}.js`);

    // If no file was found return an error
    if (!file) return reject(new Error('Task not found'));

    try {
        // Get the task name
        const taskName = file.split('.')[0];

        // Stop the setInterval function
        clearInterval(bot.tasks.get(taskName));
        // Delete the task from cache
        delete require.cache[require.resolve(`../tasks/${file}`)];
        // Delete the task from the collection
        bot.tasks.delete(taskName);

        // Get the task
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const { init } = require(`../tasks/${file}`);

        // Initialize the task
        init(bot).then((interval) => {
            bot.tasks.set(taskName, interval);
        });

        // Return the task name
        resolve(taskName);
    } catch (err) {
        // Log the error
        bot.logger.error(`Failed to reload ${file}`);
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});

/**
 * Load a task
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} task The name of the task to load
 *
 * @returns {Promise<String>} Returns the task name if the task loaded successfully
 */
exports.load = (bot, task) => new Promise((resolve, reject) => {
    // Get all the task files and get the specified task
    const files = readdirSync('./modules/tasks').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${task.toLowerCase()}.js`);

    // If the task wasn't found return an error
    if (!file) return reject(new Error('Task not found'));

    try {
        // Get the task name
        const taskName = file.split('.')[0];

        // If the task is already loaded return an error
        if (bot.tasks.get(taskName)) return reject(new Error('Task is already loaded'));

        // Import the task
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const { init } = require(`../tasks/${file}`);

        // Initialize the task
        init(bot).then((interval) => {
            bot.tasks.set(taskName, interval);
        });

        // Return the task name
        resolve(taskName);
    } catch (err) {
        // Log the error
        bot.logger.error(`Failed to load ${file}`);
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});

/**
 * Unload a task
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} task The name of the task to unload
 *
 * @returns {Promise<String>} Returns the task name if the task unloaded successfully
 */
exports.unload = (bot, task) => new Promise((resolve, reject) => {
    // Get all the task files and get the specified task
    const files = readdirSync('./modules/tasks').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${task.toLowerCase()}.js`);

    // If the task wasn't found return an error
    if (!file) return reject(new Error('Task not found'));

    try {
        // Get the task name
        const taskName = file.split('.')[0];

        // If the task is already loaded return an error
        if (!bot.tasks.get(taskName)) return reject(new Error("Task isn't loaded"));

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
        return reject(err);
    }
});
