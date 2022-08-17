import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';
import { ISettings } from '../modules/interfaces/db';
import settings from './models/settings';

export const init = async (dbUri: string) => await mongoose.connect(dbUri);

/**
 * Returns the settings of the specified Guild (or creates them if they don't exist)
 *
 * @param {Snowflake} guild The Guild ID to get the settings for
 *
 * @returns {Promise<ISettings>} Guild Data
 */
export async function getSettings(guild: Snowflake): Promise<ISettings> {
    // If the command is run in dms return default settings
    // eslint-disable-next-line new-cap
    if (!guild) return new settings();

    // Get the guild data
    const data = await settings.findOne({ _id: guild });

    // If guild data was found return it, otherwise create it
    if (data) {
        return data;
    }
    // eslint-disable-next-line new-cap
    const sets = await settings.create({ _id: guild });

    return sets;
}

/**
 * Generate the Mongoose URL
 *
 * @param {String} username Object with the mongo db username
 * @param {String} password Object with the mongo db password
 * @param {String} host Object with the mongo db host
 * @param {String} port Object with the mongo db port
 * @param {String} database Object with the mongo db database
 *
 * @returns {String} Mongoose URL
 */
export function getMongooseURL(username: string | undefined, password: string | undefined, host: string | undefined, port: string | undefined, database: string | undefined): string {
    // If there are no options replace set it as an empty object
    // eslint-disable-next-line no-param-reassign

    // Define the URL
    let URL = 'mongodb://';

    // If a username & password were specified add them to the URL
    if (password && username) { URL += `${username}:${encodeURIComponent(password)}@`; }

    // Add the host, port & database to the URL
    URL += `${(host || 'localhost')}:${(port || '27017')}/${database || 'admin'}`;

    // Return the URL
    return URL;
}
