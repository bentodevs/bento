// Import Dependencies
const { Collection } = require('discord.js');
const { readdirSync } = require('fs');

/**
 * Start the command handler and load all the commands.
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 *
 * @returns {Promise<Number>} The amount of commands loaded
 */
exports.init = (bot) => new Promise((resolve) => {
    // Create command and alias collections
    // eslint-disable-next-line no-param-reassign
    bot.commands = new Collection();
    // eslint-disable-next-line no-param-reassign
    bot.aliases = new Collection();

    // Get the category directories
    const categories = readdirSync('./commands');

    // Loop through the categories
    for (const category of categories) {
        // Get all the commands
        const commands = readdirSync(`./commands/${category}`).filter((file) => file.endsWith('.js'));

        // Loop through the commands
        for (const file of commands) {
            try {
                // Get the command file
                // eslint-disable-next-line import/no-dynamic-require, global-require
                const props = require(`../../commands/${category}/${file}`);
                // Set the command path
                props.path = `../../commands/${category}/${file}`;
                // Add the command to the collection
                bot.commands.set(props.info.name, props);

                // Loop through the aliases and add them to the alias collection
                if (props.info.aliases) {
                    props.info.aliases.forEach((alias) => {
                        bot.aliases.set(alias, props.info.name);
                    });
                }
            } catch (err) {
                // Log the error in case loading a command fails
                bot.logger.error(`Failed to load ${file}`);
                bot.logger.error(err.stack);
            }
        }
    }

    // Resolve the amount of commands that were added
    resolve(bot.commands.size);
});

/**
 * Reload a command
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} command An object with all the command data
 *
 * @returns {Promise<Boolean>} Returns true if the command was reloaded correctly.
 */
exports.reload = (bot, command) => new Promise((resolve, reject) => {
    // Grab the file path
    const { path } = command;

    try {
        // Delete the command from cache
        delete require.cache[require.resolve(path)];
        // Delete the command from the collection
        bot.commands.delete(command.info.name);

        // Grab the file
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const file = require(path);

        // Set the file path
        file.path = path;
        // Se the collection data
        bot.commands.set(command.info.name, file);

        // Resolve
        return resolve(true);
    } catch (err) {
        // Log the error
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});

/**
 * Load a command
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} command The command name to load
 * @param {String} category The category the command is in
 *
 * @returns {Promise<Object>} Returns command data if the command loaded correctly
 */
exports.load = (bot, category, command) => new Promise((resolve, reject) => {
    // If no args were specified return an error
    if (!bot || !category || !command) return reject(new Error('Missing Args'));

    try {
        // get the commands in the category
        const commands = readdirSync(`./commands/${category}`);

        // If the command isn't in the category return an error
        if (!commands.includes(`${command.toLowerCase()}.js`)) throw new Error('Command not found');

        // Import the command and set the command path
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const props = require(`../../commands/${category}/${command.toLowerCase()}`);
        props.path = `../../commands/${category}/${command.toLowerCase()}.js`;

        // If the command is already loaded return an error
        if (bot.commands.has(props.info.name)) throw new Error('Command is already loaded');

        // Add the command to the collection
        bot.commands.set(props.info.name, props);

        // If there are any aliases add them to the collection
        if (props.info.aliases) {
            props.info.aliases.forEach((alias) => {
                bot.aliases.set(alias, props.info.name);
            });
        }

        // Resolve the command data
        resolve(props);
    } catch (err) {
        // Log the error
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});

/**
 * Unload a command
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} command An object with all the command data
 *
 * @returns {Promise<Boolean>} Returns true if the command unloaded correctly
 */
exports.unload = (bot, command) => new Promise((resolve, reject) => {
    // Get the command path
    const { path } = command;

    try {
        // Delete the command from cache
        delete require.cache[require.resolve(path)];
        // Delete the command from the collection
        bot.commands.delete(command.info.name);

        // If there are any aliases delete them from the collection
        if (command.info.aliases) {
            command.info.aliases.forEach((alias) => {
                bot.aliases.delete(alias, command.info.name);
            });
        }

        // Resolve true
        resolve(true);
    } catch (err) {
        // Log the error
        bot.logger.error(err.stack);
        // Reject with the error
        return reject(err);
    }
});

/**
 * Register all global commands
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 *
 * @returns {Promise.<Boolean>} Returns true if the commands registered successfully
 */
exports.registerGlobal = (bot) => new Promise((resolve, reject) => {
    const arr = [];
    const commands = Array.from(bot.commands.values());// .filter(c => !c.opts.guildOnly);

    for (const data of commands) {
        if (data.slash?.enabled) {
            arr.push({
                name: data.info.name,
                description: data.info.description,
                type: 'CHAT_INPUT',
                options: data.slash?.opts ?? [],
            });
        }

        if (data.context?.enabled) {
            arr.push({
                name: data.info.name,
                type: 'USER',
            });
        }
    }

    // Set the guild commands
    bot.application.commands.set(arr).then(() => {
        resolve(true);
    }).catch((err) => {
        reject(err);
    });
});

/**
 * Register all guild commands
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} guildId The Guild to set the commands in
 *
 * @returns {Promise.<Boolean>} Returns true if the commands registered successfully
 */
exports.registerGuild = (bot, guildId) => new Promise((resolve, reject) => {
    const arr = [];
    const commands = Array.from(bot.commands.values()).filter((c) => c.opts.guildOnly);

    for (const data of commands) {
        if (data.slash?.enabled) {
            arr.push({
                name: data.info.name,
                description: data.info.description,
                options: data.slash?.opts ?? [],
            });
        }
    }

    // Set the guild commands
    bot.application.commands.set(arr, guildId).then(() => {
        resolve(true);
    }).catch((err) => {
        reject(err);
    });
});
