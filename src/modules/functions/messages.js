const config = require("../../config");

module.exports = message => {

    /**
     * Send a message starting with a error emote
     * @param {option} option 
     */
    message.error = option => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.error} ${option.content}`;

            // Send the message
            message.channel.send(typeof(option) == "object" ? option : `${config.emojis.error} ${option}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

    /**
     * Send a message starting with a loading emote
     * @param {string} option 
     */
    message.loading = option => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.loading} ${option.content}`;

            // Send the message
            message.channel.send(typeof(option) == "object" ? option : `${config.emojis.loading} ${option}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

    /**
     * Send a message starting with a confirmation emote
     * @param {string} option 
     */
    message.confirmation = option => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.confirmation} ${option.content}`;

            // Send the message
            message.channel.send(typeof(option) == "object" ? option : `${config.emojis.confirmation} ${option}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

    /**
     * Reply to the previous message with an error emote
     * @param {srring} option
     */
    message.errorReply = option => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.error} ${option.content}`;
            
            // Send the reply
            message.reply(typeof(option) == "object" ? option : `${config.emojis.error} ${option}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

    /**
     * Reply to the previous message with an error emote
     * @param {srring} option
     */
    message.loadingReply = option => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.loading} ${option.content}`;
            
            // Send the reply
            message.reply(typeof(option) == "object" ? option : `${config.emojis.loading} ${option}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };

    /**
     * Reply to the previous message with an error emote
     * @param {srring} option
     */
    message.confirmationReply = option => {
        return new Promise((resolve, reject) => {
            // Check if the option is a object and if so update the content
            if (typeof(option) == "object" && option.content)
                option.content = `${config.emojis.confirmation} ${option.content}`;
            
            // Send the reply
            message.reply(typeof(option) == "object" ? option : `${config.emojis.confirmation} ${option}`)
                .then(msg => { resolve(msg); })
                .catch(err => { reject(err); });
        });
    };
    
};