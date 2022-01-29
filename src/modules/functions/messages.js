/* eslint-disable no-param-reassign */
import config from '../../config.js';

export default (message) => {
    /**
     * Send a message starting with a error emote
     * @param {option} option
     */
    message.error = (option) => new Promise((resolve, reject) => {
        // Check if the option is a object and if so update the content
        if (typeof (option) === 'object' && option.content) option.content = `${config.emojis.error} ${option.content}`;

        // Send the message
        message.channel.send(typeof (option) === 'object' ? option : `${config.emojis.error} ${option}`)
            .then((msg) => { resolve(msg); })
            .catch((err) => { reject(err); });
    });

    /**
     * Send a message starting with a loading emote
     * @param {string} option
     */
    message.loading = (option) => new Promise((resolve, reject) => {
        // Check if the option is a object and if so update the content
        if (typeof (option) === 'object' && option.content) option.content = `${config.emojis.loading} ${option.content}`;

        // Send the message
        message.channel.send(typeof (option) === 'object' ? option : `${config.emojis.loading} ${option}`)
            .then((msg) => { resolve(msg); })
            .catch((err) => { reject(err); });
    });

    /**
     * Send a message starting with a confirmation emote
     * @param {string} option
     */
    message.confirmation = (option) => new Promise((resolve, reject) => {
        // Check if the option is a object and if so update the content
        if (typeof (option) === 'object' && option.content) option.content = `${config.emojis.confirmation} ${option.content}`;

        // Send the message
        message.channel.send(typeof (option) === 'object' ? option : `${config.emojis.confirmation} ${option}`)
            .then((msg) => { resolve(msg); })
            .catch((err) => { reject(err); });
    });

    /**
     * Reply to the previous message with an error emote
     * @param {srring} option
     */
    message.errorReply = (option) => new Promise((resolve, reject) => {
        // Check if the option is a object and if so update the content
        if (typeof (option) === 'object' && option.content) option.content = `${config.emojis.error} ${option.content}`;

        // Send the reply
        message.reply(typeof (option) === 'object' ? option : `${config.emojis.error} ${option}`)
            .then((msg) => { resolve(msg); })
            .catch((err) => { reject(err); });
    });

    /**
     * Reply to the previous message with an error emote
     * @param {srring} option
     */
    message.loadingReply = (option) => new Promise((resolve, reject) => {
        // Check if the option is a object and if so update the content
        if (typeof (option) === 'object' && option.content) option.content = `${config.emojis.loading} ${option.content}`;

        // Send the reply
        message.reply(typeof (option) === 'object' ? option : `${config.emojis.loading} ${option}`)
            .then((msg) => { resolve(msg); })
            .catch((err) => { reject(err); });
    });

    /**
     * Reply to the previous message with an error emote
     * @param {srring} option
     */
    message.confirmationReply = (option) => new Promise((resolve, reject) => {
        // Check if the option is a object and if so update the content
        if (typeof (option) === 'object' && option.content) option.content = `${config.emojis.confirmation} ${option.content}`;

        // Send the reply
        message.reply(typeof (option) === 'object' ? option : `${config.emojis.confirmation} ${option}`)
            .then((msg) => { resolve(msg); })
            .catch((err) => { reject(err); });
    });
};
