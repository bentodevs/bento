// Import Models
const settings = require("./models/settings");

/**
 * Returns the settings of the specified Guild (or creates them if they don't exist)
 * 
 * @param {String} guild The Guild ID to get the settings for
 * 
 * @returns {Promise<Object>} Guild Data
 */
exports.getSettings = async guild => {
    const data = await settings.findOne({ _id: guild });

    if (data) {
        return data;
    } else {
        return await new settings({
            _id: guild
        }).save();
    }
};

/**
 * Generate the Mongoose URL
 * 
 * @param {Object} options Object with the mongo db credentials
 * 
 * @returns {String} Mongoose URL
 */
exports.getMongooseURL = options => {
    // If there are no options replace set it as an empty object
    options = options || {};

    // Define the URL
    let URL = "mongodb://";

    // If a username & password were specified add them to the URL
    if (options.password && options.username) 
        URL += `${options.username}:${encodeURIComponent(options.password)}@`;

    // Add the host, port & database to the URL
    URL += `${(options.host || 'localhost')}:${(options.port || "27017")}/${options.database || "admin"}`;

    // Return the URL
    return URL;
};