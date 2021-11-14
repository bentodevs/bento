const { readdirSync } = require('fs');

/**
 * Start the event handler and load all events.
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 *
 * @returns {Promise<Number>} The amount of events loaded
 */
exports.init = (bot) => new Promise((resolve) => {
    // Get all the event files
    const files = readdirSync('./events').filter((file) => file.endsWith('.js'));

    // Loop through the files
    for (const data of files) {
        try {
            // Get the event name and the event file
            const eventName = data.split('.')[0];
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const event = require(`../../events/${data}`);

            if (eventName === 'ready') {
                // Only fire the ready event once
                bot.once(eventName, event.bind(null, bot));
            } else {
                // Run the event
                bot.on(eventName, event.bind(null, bot));
            }
        } catch (err) {
            // Log the error in case loading a event fails
            bot.logger.error(`Failed to load ${data}`);
            bot.logger.error(err.stack);
        }
    }

    // Resolve the amount of events that were loaded
    resolve(files.length);
});

/**
 * Reload a event
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} event The name of the event to reload
 *
 * @returns {Promise<String>} Returns the event name if the event reloaded successfully
 */
exports.reload = (bot, event) => new Promise((resolve, reject) => {
    // Get all the event files and find the event specified
    const files = readdirSync('./events').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${event.toLowerCase()}.js`);

    // If the event doesn't exist return an error
    if (!file) return reject(new Error('Event not found'));
    // If the user specified the ready event return an error
    if (file === 'ready.js') return reject(new Error("The ready event can't be reloaded"));

    try {
        // Get the event name
        const eventName = file.split('.')[0];

        // Delete the command from cache
        delete require.cache[require.resolve(`../../events/${file}`)];
        // Stop listening to the event
        bot.removeAllListeners(eventName);

        // Get the event
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const data = require(`../../events/${file}`);
        // Register the event
        bot.on(eventName, data.bind(null, bot));

        // Return the event name
        resolve(eventName);
    } catch (err) {
        // Log the error
        bot.logger.error(`Failed to reload ${file}`);
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});

/**
 * Load a event
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} event The name of the event to load
 *
 * @returns {Promise<String>} Returns the event name if the event loaded successfully
 */
exports.load = (bot, event) => new Promise((resolve, reject) => {
    // Get all the event files and find the event specified
    const files = readdirSync('./events').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${event.toLowerCase()}.js`);

    // If the event doesn't exist return an error
    if (!file) return reject(new Error('Event not found'));
    // If the user specified the ready event return an error
    if (file === 'ready.js') return reject(new Error("The ready event can't be loaded"));

    try {
        // Get the event name
        const eventName = file.split('.')[0];

        // If the event already has listeners return an error
        if (bot.listeners(eventName).length) return reject(new Error('Event is already loaded'));

        // Get the event
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const data = require(`../../events/${file}`);
        // Register the event
        bot.on(eventName, data.bind(null, bot));

        // Return the event name
        resolve(eventName);
    } catch (err) {
        // Log the error
        bot.logger.error(`Failed to load ${file}`);
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});

/**
 * Unload a event
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} event The name of the event to unload
 *
 * @returns {Promise<String>} Returns the event name if the event unloaded successfully
 */
exports.unload = (bot, event) => new Promise((resolve, reject) => {
    // Get all the event files and find the event specified
    const files = readdirSync('./events').filter((file) => file.endsWith('.js'));
    const file = files.find((e) => e.toLowerCase() === `${event.toLowerCase()}.js`);

    // If the event doesn't exist return an error
    if (!file) return reject(new Error('Event not found'));
    // If the user specified the ready event return an error
    if (file === 'ready.js') return reject(new Error("The ready event can't be unloaded"));

    try {
        // Get the event name
        const eventName = file.split('.')[0];

        // If the event doesn't have any listeners return an error
        if (!bot.listeners(eventName).length) return reject(new Error("Event isn't loaded"));

        // Delete the command from cache
        delete require.cache[require.resolve(`../../events/${file}`)];
        // Stop listening to the event
        bot.removeAllListeners(eventName);

        // Return the event name
        resolve(eventName);
    } catch (err) {
        // Log the error
        bot.logger.error(`Failed to load ${file}`);
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});
