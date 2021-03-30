const { readdirSync } = require("fs");

/**
 * Start the event handler and load all events.
 * 
 * @param {Object} bot The client which is used to transact between this app & Discord
 * 
 * @returns {Promise<Number} The amount of events loaded
 */
exports.init = bot => {
    return new Promise((resolve) => {
        // Get all the event files
        const files = readdirSync("./events").filter(file => file.endsWith(".js"));

        // Loop through the files
        for (const data of files) {
            try {
                // Get the event name and the event file
                const eventName = data.split(".")[0],
                event = require(`../../events/${data}`);

                if (eventName == "ready") {
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
};