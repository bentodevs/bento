// Import Dependencies
import { Collection } from 'discord.js';
import { readdirSync } from 'fs';

/**
 * Start the command handler and load all the commands.
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 *
 * @returns {Promise<Number>} The amount of commands loaded
 */
export const init = (bot) => new Promise((resolve) => {
    // Create command and alias collections
    // eslint-disable-next-line no-param-reassign
    bot.commands = new Collection();
    // eslint-disable-next-line no-param-reassign
    bot.aliases = new Collection();

    // Get the category directories
    const categories = readdirSync('./src/commands');

    // Loop through the categories
    for (const category of categories) {
        // Get all the commands
        const commands = readdirSync(`./src/commands/${category}`).filter((file) => file.endsWith('.js'));

        // Loop through the commands
        for (const file of commands) {
            // Import the command
            import(`../../commands/${category}/${file}`).then((cmd) => {
                // Clone the command object to a new object
                const obj = Object.create(cmd.default);

                // Set the command path
                obj.path = `../../commands/${category}/${file}`;
                // Register the command
                bot.commands.set(cmd.default.info.name, obj);

                if (cmd.default.info.aliases) {
                    cmd.default.info.aliases.forEach((alias) => {
                        bot.aliases.set(alias, cmd.default.info.name);
                    });
                }
            }).catch((err) => {
                bot.logger.error(`Failed to load ${file}`);
                bot.logger.error(err.stack);
            });
        }
    }

    // Resolve the amount of commands that were added
    resolve();
});

/**
 * Reload a command
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} command An object with all the command data
 *
 * @returns {Promise<Boolean>} Returns true if the command was reloaded correctly.
 */
export const reload = (bot, command) => new Promise((resolve, reject) => {
    // Grab the file path
    const { path } = command;

    // Delete the command from cache
    bot.commands.delete(command.info.name);

    // If there are any aliases delete them from the collection
    if (command.info.aliases) {
        command.info.aliases.forEach((alias) => {
            bot.aliases.delete(alias, command.info.name);
        });
    }

    import(path).then((cmd) => {
        // Clone the command object to a new object
        const obj = Object.create(cmd.default);

        // Set the command path
        obj.path = path;
        // Register the command
        bot.commands.set(obj.info.name, obj);

        // Resolve the command reload
        return resolve(true);
    }).catch((err) => {
        // Log the error
        bot.logger.error(`Failed to reload ${path}`);
        bot.logger.error(err.stack);

        // Reject the command reload
        return reject(err);
    });
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
export const load = (bot, category, command) => new Promise((resolve, reject) => {
    // If no args were specified return an error
    if (!bot || !category || !command) reject(new Error('Missing Args'));

    // get the commands in the category
    const commands = readdirSync(`./commands/${category}`);

    // If the command isn't in the category return an error
    if (!commands.includes(`${command.toLowerCase()}.js`)) throw new Error('Command not found');

    // Import the command
    import(`../../commands/${category}/${command.toLowerCase()}.js`).then((cmd) => {
        // Clone the command object to a new object
        const obj = Object.create(cmd.default);

        if (bot.commands.has(cmd.default.info.name)) throw new Error('Command already loaded');

        // Set the command path
        obj.path = `../../commands/${category}/${command.toLowerCase()}.js`;
        // Register the command
        bot.commands.set(cmd.default.info.name, obj);

        if (cmd.default.info.aliases?.length) {
            cmd.default.info.aliases.forEach((alias) => {
                bot.aliases.set(alias, cmd.default.info.name);
            });
        }

        // Resolve the command data
        resolve(cmd.default);
    }).catch((err) => {
        bot.logger.error(`Failed to load ${command.toLowerCase()}`);
        bot.logger.error(err.stack);

        // Reject with the error
        reject(err);
    });
});

/**
 * Unload a command
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} command An object with all the command data
 *
 * @returns {Promise<Boolean>} Returns true if the command unloaded correctly
 */
export const unload = (bot, command) => new Promise((resolve, reject) => {
    try {
        // Delete the command from cache
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
        reject(err);
    }
});

/**
 * Register all global commands
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 *
 * @returns {Promise.<Boolean>} Returns true if the commands registered successfully
 */
export const registerGlobal = (bot) => new Promise((resolve, reject) => {
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
export const registerGuild = (bot, guildId) => new Promise((resolve, reject) => {
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
