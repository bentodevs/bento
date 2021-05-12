const config = require("../../config");

module.exports = message => {

    /**
     * Send a message starting with a error emote
     * @param {string} string 
     */
    message.error = string => {
        return new Promise((resolve, reject) => {
            message.channel.send(`${config.emojis.error} ${string}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

    /**
     * Send a message starting with a loading emote
     * @param {string} string 
     */
    message.loading = string => {
        return new Promise((resolve, reject) => {
            message.channel.send(`${config.emojis.loading} ${string}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

    /**
     * Send a message starting with a confirmation emote
     * @param {string} string 
     */
    message.confirmation = string => {
        return new Promise((resolve, reject) => {
            message.channel.send(`${config.emojis.confirmation} ${string}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

};