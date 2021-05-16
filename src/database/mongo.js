// Import Models
const permissions = require("./models/permissions");
const settings = require("./models/settings");

/**
 * Returns the settings of the specified Guild (or creates them if they don't exist)
 * 
 * @param {String} guild The Guild ID to get the settings for
 * 
 * @returns {Promise<Object>} Guild Data
 */
exports.getSettings = async guild => {
    // If the command is run in dms return default settings
    if (!guild)
        return new settings();

    // Get the guild data
    const data = await settings.findOne({ _id: guild });

    // If guild data was found return it, otherwise create it
    if (data) {
        return data;
    } else {
        return await new settings({
            _id: guild
        }).save();
    }
};

/**
 * Get the permissions for the specified Guild
 * 
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {String} guild The Guild ID to get the permissions for
 * 
 * @returns {Promise<Object>} Permission Data
 */
exports.getPerms = async (bot, guild) => {
    // Define the defaults and return objects
    const defaults = {},
    commandPerms = {};

    // Loop through the commands and set the defaults
    for (const command of bot.commands.array()) {
        defaults[command.info.name] = {
            permission: command.perms.permission,
            type: command.perms.type
        };
    }

    // If the command was in DMs return the defaults
    if (!guild)
        return defaults;

    // Get the guild data
    let guildData = await permissions.findOne({ _id: guild });

    // If there is no guild data create the database object
    if (!guildData) {
        guildData = await new permissions({
            _id: guild
        }).save();
    }

    // Create the return object
    Object.keys(defaults).forEach(key => {
       commandPerms[key] = guildData.permissions?.commands?.[key] ?? defaults[key]; 
    });

    // Return the return object
    return {
        commands: commandPerms,
        categories: guildData.permissions?.categories ?? {}
    };
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