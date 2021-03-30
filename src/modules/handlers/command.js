const { readdirSync } = require('fs');

exports.init = (bot) => {
    return new Promise((resolve) => {
        bot.commands = new Map();
        bot.aliases = new Map();

        const categories = readdirSync("./commands");

        for (const category of categories) {
            const commands = readdirSync(`./commands/${category}`).filter(file => file.endsWith(".js"));

            for (const file of commands) {
                try {
                    const props = require(`../../commands/${category}/${file}`);

                    props.path = `../../commands/${category}/${file}`;

                    bot.commands.set(props.information.name, props);
                
                    if (props.information.aliases) props.information.aliases.forEach(alias => {
                        bot.aliases.set(alias, props.information.name);
                    });
                } catch (err) {
                    bot.logger.error(`Failed to load ${file}`);
                    bot.logger.error(err.stack);
                }
            }
        }
                    
        resolve(bot.commands.size);
    });
};

exports.reload = (bot, command) => {
    return new Promise((resolve, reject) => {
        // Grab the file path
        const path = command.path;

        try {
            // Delete the command from cache
            delete require.cache[require.resolve(path)];
            // Delete the command from the enmap
            bot.commands.delete(command.information.name);

            // Grab the file
            const file = require(path);

            // Set the file path
            file.path = path;
            // Se the enmap data
            bot.commands.set(command.information.name, file);

            // Resolve
            return resolve(true);
        } catch (err) {
            // Log the error
            bot.logger.error(err);
            // Reject with the error
            return reject(false);
        }
    });
};