/* eslint-disable @typescript-eslint/no-explicit-any */
import { request } from "undici";
import logger from "../../logger";

/**
 * Fetch a user's LastFM Profile
 *
 * @param {Sring} user The user to fetch
 *
 * @returns {Promise.<Object>} Last.fm user
 */
export const getLastFMUser = (user: string): Promise<object> => new Promise((resolve, reject) => {
    // Define the LastFM API URL
    const URL = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${user}&api_key=${process.env.LASTFM_TOKEN}&format=json`;

    // Fetch the URL
    request(URL, {
        headers: {
            'accept': 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        }
    })
        .then((res) => res.body.json())
        .then((d: any) => {
            if (d?.error === 6) {
                // If the user isn't found, throw an error
                reject(new Error('User not found'));
            } else if (d?.error) {
                // If there is an unknown error, then throw and log to console
                logger.error(d.error.message);
                reject(new Error('An unknown error occurred!'));
            } else {
                // Resolve the User
                resolve(d);
            }
        })
        .catch((err) => new Error(err));
});

/**
 * Fetch a user's LastFM listening history
 *
 * @param {Sring} user The user to fetch
 *
 * @returns {Promise.<Object>} Last.fm user play history
 */
export const getLastFMUserHistory = (user: string): Promise<object> => new Promise((resolve, reject) => {
    const URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${process.env.LASTFM_TOKEN}&format=json`;
    request(URL, {
        headers: {
            'accept': 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        }
    })
        .then((res) => res.body.json())
        .then((data: any) => {
            if (data?.error === 6) {
                reject(new Error('User not found'));
            } else if (data?.error) {
                logger.error(data.error.message);
                reject(new Error('An unknown error occurred!'));
            } else {
                console.log(data);
                resolve(data);
            }
        });
});
