const { readdirSync } = require("fs");

exports.init = (bot) => {
    return new Promise((resolve) => {
        const files = readdirSync("./modules/tasks").filter(file => file.endsWith(".js"));

        for (const data of files) {
            try {
                const { init } = require(`../tasks/${data}`);

                init(bot);
            } catch (err) {
                bot.logger.error(`Failed to load ${data}`);
                bot.logger.error(err.stack);
            }
        }

        resolve(files.length);
    });
};