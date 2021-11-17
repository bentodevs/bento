const { default: fetch } = require('node-fetch');

const endpoint = 'https://disease.sh';

/**
 * Get covid stats from the disease.sh API
 *
 * @returns {Promise.<Object>} Global Covid Stats
 */
exports.getGlobalStats = () => new Promise((resolve, reject) => {
    // Specify the API URL
    const URL = `${endpoint}/v3/covid-19/all`;

    // Fetch the API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => res.json()).then((json) => {
        resolve(json);
    }).catch((err) => {
        console.error(err);
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
exports.getAllCountryData = (sort) => new Promise((resolve, reject) => {
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
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => res.json()).then((json) => {
        resolve(json);
    }).catch((err) => {
        console.error(err);
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
exports.getDataByCountry = (country) => new Promise((resolve, reject) => {
    // Return an error if no country was specified
    if (!country) reject(new Error('Missing Args!'));

    // Define the URL
    const URL = `${endpoint}/v3/covid-19/countries/${country}`;

    // Fetch the API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => {
        if (!res || res.status !== 200) resolve(undefined);

        res.json().then((json) => {
            resolve(json);
        });
    }).catch((err) => {
        console.error(err);
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
exports.getDataByContinent = (continent) => new Promise((resolve, reject) => {
    // Return an error if no continent was specified
    if (!continent) reject(new Error('Missing Args!'));

    // Define the URL
    const URL = `${endpoint}/v3/covid-19/continents/${continent}`;

    // Fetch the API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => {
        if (!res || res.status !== 200) resolve(undefined);

        res.json().then((json) => {
            resolve(json);
        });
    }).catch((err) => {
        console.error(err);
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
exports.getDataByState = (state) => new Promise((resolve, reject) => {
    // Return an error if no state was specified
    if (!state) reject(new Error('Missing Args!'));

    // Define the URL
    const URL = `${endpoint}/v3/covid-19/states/${state}`;

    // Fetch the API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => {
        if (!res || res.status !== 200) resolve(undefined);

        res.json().then((json) => {
            resolve(json);
        });
    }).catch((err) => {
        console.error(err);
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
exports.getVaccineData = (days, full, type, data) => new Promise((resolve, reject) => {
    // If an invalid type is specified return an error
    if (type && !['countries', 'states'].includes(type)) reject(new Error('Invalid Args!'));
    // If a type is specified but no data return an error
    if (type && !data) reject(new Error('Missing Args!'));

    // Specify the API URL
    const URL = `${endpoint}/v3/covid-19/vaccine/coverage${type ? `/${type}/${data}` : ''}?lastdays=${days}&fullData=${full ? 'true' : 'false'}`;

    // Fetch the API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => {
        if (!res || res.status !== 200) resolve(undefined);

        res.json().then((json) => {
            resolve(json);
        });
    }).catch((err) => {
        console.error(err);
        reject(err);
    });
});
