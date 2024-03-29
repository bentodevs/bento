/* eslint-disable @typescript-eslint/no-explicit-any */
import { request } from 'undici';
import logger from '../../logger';

const endpoint = 'https://disease.sh';

/**
 * Get covid stats from the disease.sh API
 *
 * @returns {Promise.<Object>} Global Covid Stats
 */
export const getGlobalStats = (): Promise<object> => new Promise((resolve, reject) => {
    // Specify the API URL
    const URL = `${endpoint}/v3/covid-19/all`;

    // Fetch the API
    request(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        },
    }).then((res) => res.body.json()).then((json: any) => {
        resolve(json);
    }).catch((err) => {
        logger.error(err);
        reject(err);
    });
});

/**
 * Fetch covid stats for all countries,
 *
 * @param {String} sort "cases" or "deaths"
 *
 * @returns {Promise.<Array>} An array with covid stats for all countries
 */
export const getAllCountryData = (sort: string): Promise<Array<any>> => new Promise((resolve, reject) => {
    // Define the sort options
    const sortOpts = [
        'cases',
        'deaths',
    ];

    // If an invalid sort option was specified return an error
    if (!sortOpts.includes(sort)) reject(new Error('Invalid Args!'));

    // Define the URL
    const URL = `${endpoint}/v3/covid-19/countries/?sort=${sort}`;

    // Fetch the API
    request(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        },
    }).then((res) => res.body.json()).then((json: any) => {
        resolve(json);
    }).catch((err) => {
        logger.error(err);
        reject(err);
    });
});

/**
 * Get covid stats for a specific country
 *
 * @param {String} country
 *
 * @returns {Promise.<Object>} Covid stats for the specified country
 */
export const getDataByCountry = (country: string): Promise<object | undefined> => new Promise((resolve, reject) => {
    // Define the URL
    const URL = `${endpoint}/v3/covid-19/countries/${country}`;

    // Fetch the API
    request(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        },
    }).then((res) => {
        if (!res || res.statusCode !== 200) resolve(undefined);

        res.body.json().then((json: any) => {
            resolve(json);
        });
    }).catch((err) => {
        logger.error(err);
        reject(err);
    });
});

/**
 * Get covid stats for a specific continent
 *
 * @param {String} continent
 *
 * @returns {Promise.<Object>} Covid stats for the specified continent
 */
export const getDataByContinent = (continent: string): Promise<object | undefined> => new Promise((resolve, reject) => {
    // Return an error if no continent was specified
    if (!continent) reject(new Error('Missing Args!'));

    // Define the URL
    const URL = `${endpoint}/v3/covid-19/continents/${continent}`;

    // Fetch the API
    request(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        },
    }).then((res) => {
        if (!res || res.statusCode !== 200) resolve(undefined);

        res.body.json().then((json: any) => {
            resolve(json);
        });
    }).catch((err) => {
        logger.error(err);
        reject(err);
    });
});

/**
 * Get covid stats for a specific US state
 *
 * @param {String} state
 *
 * @returns {Promise.<Object>} Covid stats for the specified US state
 */
export const getDataByState = (state: string): Promise<object | undefined> => new Promise((resolve, reject) => {
    // Return an error if no state was specified
    if (!state) reject(new Error('Missing Args!'));

    // Define the URL
    const URL = `${endpoint}/v3/covid-19/states/${state}`;

    // Fetch the API
    request(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        },
    }).then((res) => {
        if (!res || res.statusCode !== 200) resolve(undefined);

        res.body.json().then((json: any) => {
            resolve(json);
        });
    }).catch((err) => {
        logger.error(err);
        reject(err);
    });
});

/**
 * Get Covid-19 vaccination data
 *
 * @param {Number} days Amount of days to return data for
 * @param {Boolean} full If the API should return full data or just the number of vaccinations
 * @param {String} type "countries" or "states", leave empty for global
 * @param {String} data a country or state
 *
 * @returns {Promise.<Object>} Vaccination Data
 */
export const getVaccineData = (days: number, full: boolean, type: string, data: string): Promise<object | undefined> => new Promise((resolve, reject) => {
    // If an invalid type is specified return an error
    if (type && !['countries', 'states'].includes(type)) reject(new Error('Invalid Args!'));
    // If a type is specified but no data return an error
    if (type && !data) reject(new Error('Missing Args!'));

    // Specify the API URL
    const URL = `${endpoint}/v3/covid-19/vaccine/coverage${type ? `/${type}/${data}` : ''}?lastdays=${days}&fullData=${full ? 'true' : 'false'}`;

    // Fetch the API
    request(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
        },
    }).then((res) => {
        if (!res || res.statusCode !== 200) resolve(undefined);

        res.body.json().then((json: any) => {
            resolve(json);
        });
    }).catch((err) => {
        logger.error(err);
        reject(err);
    });
});
