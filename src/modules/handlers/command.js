// Import Dependencies
const { Collection } = require("discord.js");
const { readdirSync } = require("fs");

/**
 * Start the command handler and load all the commands.
 * 
 * @param {Object} bot The client which is used to transact between this app & Discord
 * 
 * @returns {Promise<Number>} The amount of commands loaded
 */
exports.init = (bot) => {
    return new Promise((resolve) => {
        // Create command and alias collections
        bot.commands = new Collection();
        bot.aliases = new Collection();

        // Get the category directories
        const categories = readdirSync("./commands");

        // Loop through the categories
        for (const category of categories) {
            // Get all the commands
            const commands = readdirSync(`./commands/${category}`).filter(file => file.endsWith(".js"));

            // Loop through the commands
            for (const file of commands) {
                try {
                    // Get the command file
                    const props = require(`../../commands/${category}/${file}`);
                    // Set the command path
                    props.path = `../../commands/${category}/${file}`;
                    // Add the command to the collection
                    bot.commands.set(props.info.name, props);
                
                    // Loop through the aliases and add them to the alias collection
                    if (props.info.aliases) props.info.aliases.forEach(alias => {
                        bot.aliases.set(alias, props.info.name);
                    });
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
};

/**
 * Reload a command
 * 
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} command An object with all the command data
 * 
 * @returns {Promise<Boolean>} Returns true if the command was reloaded correctly.
 */
exports.reload = (bot, command) => {
    return new Promise((resolve, reject) => {
        // Grab the file path
        const path = command.path;

        try {
            // Delete the command from cache
            delete require.cache[require.resolve(path)];
            // Delete the command from the enmap
            bot.commands.delete(command.info.name);

            // Grab the file
            const file = require(path);

            // Set the file path
            file.path = path;
            // Se the enmap data
            bot.commands.set(command.info.name, file);

            // Resolve
            return resolve(true);
        } catch (err) {
            // Log the error
            bot.logger.error(err);
            // Reject with the error
            return reject(err);
        }
    });
};