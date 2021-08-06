const config = require("../../config");

module.exports = interaction => {

    /**
     * Send a interaction reply starting with a error emote
     * @param {string} option
     */
    interaction.error = (option) => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.error} ${option.content}`;

            // Send the reply
            interaction.reply(typeof(option) == "object" ? option : `${config.emojis.error} ${option}`)
                .then(int => resolve(int))
                .catch(err => reject(err));
        });
    };

    /**
     * Send a interaction reply starting with a loading emote
     * @param {string} option
     */
     interaction.loading = (option) => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.loading} ${option.content}`;

            // Send the reply
            interaction.reply(typeof(option) == "object" ? option : `${config.emojis.loading} ${option}`)
                .then(int => resolve(int))
                .catch(err => reject(err));
        });
    };

    /**
     * Send a interaction reply starting with a confirmation emote
     * @param {string} string
     */
     interaction.confirmation = (option) => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.confirmation} ${option.content}`;

            // Send the reply
            interaction.reply(typeof(option) == "object" ? option : `${config.emojis.confirmation} ${option}`)
                .then(int => resolve(int))
                .catch(err => reject(err));
        });
    };

};