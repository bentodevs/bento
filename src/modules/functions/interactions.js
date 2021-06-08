const config = require("../../config");

module.exports = interaction => {

    /**
     * Send a interaction reply starting with a error emote
     * @param {string} string 
     */
    interaction.error = (string, options) => {
        return new Promise((resolve, reject) => {
            interaction.reply(`${config.emojis.error} ${string}`, options ?? {})
                .then(int => resolve(int))
                .catch(err => reject(err));
        });
    };

    /**
     * Send a interaction reply starting with a loading emote
     * @param {string} string 
     */
     interaction.loading = (string, options) => {
        return new Promise((resolve, reject) => {
            interaction.reply(`${config.emojis.loading} ${string}`, options ?? {})
                .then(int => resolve(int))
                .catch(err => reject(err));
        });
    };

    /**
     * Send a interaction reply starting with a confirmation emote
     * @param {string} string 
     */
     interaction.confirmation = (string, options) => {
        return new Promise((resolve, reject) => {
            interaction.reply(`${config.emojis.confirmation} ${string}`, options ?? {})
                .then(int => resolve(int))
                .catch(err => reject(err));
        });
    };

}; 