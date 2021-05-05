const { default: fetch } = require("node-fetch");
const config = require("../../config");

/**
 * Get a definition from the urbandictionary api
 * 
 * @param {String} query
 *  
 * @returns {Promise<Object>} definition
 * 
 * @example
 * 
 * urban("lol").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
exports.urban = (query) => {
    return new Promise((resolve, reject) => {
        // If no query was specified return an error
        if (!query)
            return new Error("Missing Args!");

        // Define the API URL
        const URL = `https://api.urbandictionary.com/v0/define?term=${query}`;

        // Fetch the urbandictionary API
        fetch(URL, {
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            }
        }).then(res => res.json()).then(json => {
            // If something went wrong return null
            if (json.error)
                return resolve(null);
            // If no results were found return null
            if (!json.list.length)
                return resolve(null);

            // Sort the data by thumps_up and return the result with the most thumps up
            const result = json.list.sort((a, b) => b.thumps_up - a.thumps_up)[0];

            // Remove urban dictionary formatting
            result.definition = result.definition.removeUrbanFormatting();
            result.example = result.example.removeUrbanFormatting();

            // Return the result
            return resolve(result);
        }).catch(err => {
            // Log and reject the error
            console.error(err);
            reject(err);
        });
    });
};

/**
 * Gets a random meme from reddit
 * 
 * @returns {Promise<Object>} Reddit Post
 * 
 * @example
 * 
 * getMeme().then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
exports.getMeme = () => {
    return new Promise((resolve, reject) => {
        // Define all the subreddits
        const subs = [
            "memes",
            "dankmemes",
            "wholesomememes",
            "BikiniBottomTwitter",
            "funny"
        ];

        // Get a random subreddit
        const sub = subs[Math.floor(Math.random() * subs.length)];

        // Define the API URL
        const URL = `https://www.reddit.com/r/${sub}.json?sort=top&t=week&limit=100`;

        // Fetch the reddit API
        fetch(URL, {
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            }
        }).then(res => res.json()).then(json => {
            // Filter out all the bad posts
            const filtered = json.data.children.filter(p => !p.data.over_18 && p.data.post_hint !== "hosted:video" && p.data.post_hint !== "link" && p.data.post_hint !== "self" && p.data.post_hint);

            // If no memes remain return an error
            if (!filtered.length)
                return reject(new Error("No Memes Found!"));

            // Get a random post
            const post = filtered[Math.floor(Math.random() * filtered.length)];

            // Return the post
            resolve(post);
        }).catch(err => {
            // Log and reject the error
            console.error(err);
            reject(err);
        });
    });
};

/**
 * Get weather data for a certain location
 * 
 * @param {String} query
 *  
 * @returns {Promise<Object>} weather data
 * 
 * @example
 * 
 * getWeather("Amsterdam").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
exports.getWeather = (query) => {
    return new Promise((resolve, reject) => {
        // Define the API URL
        const URL = `https://api.weatherapi.com/v1/current.json?key=${config.general.weatherApiKey}&q=${query}`;

        // Fetch the weather API
        fetch(URL, {
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            }
        }).then(res => res.json()).then(json => {
            if (json.error) {
                if (json.error.code == 1006) {
                    // If the error is 1006 return undefined
                    return resolve(undefined);
                } else {
                    // If its any other error return a new error
                    return reject(new Error(json.error.message));
                }
            } else {
                // Resolve the weather data
                resolve(json);
            }
        }).catch(err => {
            // Log and reject the error
            console.error(err);
            reject(err);
        });
    });
};

/**
 * Fetches a random dad joke from the icanhazdadjoke.com api
 * 
 * @returns {Promise<Object>} dad joke data
 * 
 * @example
 * 
 * getDadjoke().then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(data);
 * })
 */
exports.getDadjoke = () => {
    return new Promise((resolve, reject) => {
        // Define the API URL
        const URL = "https://icanhazdadjoke.com/";

        // Fetch the dadjoke API
        fetch(URL, {
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            }
        }).then(res => res.json()).then(json => {
            // Return the joke
            resolve(json);
        }).catch(err => {
            // Log and reject the error
            console.error(err);
            reject(err);
        });
    });
};

/**
 * Parse a timestring
 *
 * @param {string} string
 * @param {string} returnUnit
 * @param {Object} opts
 * 
 * @returns {number}
 */
exports.parseTime = (string, returnUnit, opts) => {
    const DEFAULT_OPTS = {
        hoursPerDay: 24,
        daysPerWeek: 7,
        weeksPerMonth: 4,
        monthsPerYear: 12,
        daysPerYear: 365.25
    };

    const UNIT_MAP = {
        ms: ['ms', 'milli', 'millisecond', 'milliseconds'],
        s: ['s', 'sec', 'secs', 'second', 'seconds'],
        m: ['m', 'min', 'mins', 'minute', 'minutes'],
        h: ['h', 'hr', 'hrs', 'hour', 'hours'],
        d: ['d', 'day', 'days'],
        w: ['w', 'week', 'weeks'],
        mth: ['mon', 'mth', 'mths', 'month', 'months'],
        y: ['y', 'yr', 'yrs', 'year', 'years']
    };

    opts = Object.assign({}, DEFAULT_OPTS, opts || {});

    let totalSeconds = 0;

    const unitValues = getUnitValues(opts),
        groups = string
            .toLowerCase()
            .replace(/[^.\w+-]+/g, '')
            .match(/[-+]?[0-9.]+[a-z]+/g);

    if (groups === null) {
        return null;
    }

    groups.forEach(group => {
        const value = group.match(/[0-9.]+/g)[0],
            unit = group.match(/[a-z]+/g)[0];

        totalSeconds += getSeconds(value, unit, unitValues);
    });

    if (returnUnit) {
        return convert(totalSeconds, returnUnit, unitValues);
    }

    return totalSeconds;


    function getUnitValues(opts) {
        const unitValues = {
            ms: 0.001,
            s: 1,
            m: 60,
            h: 3600
        };

        unitValues.d = opts.hoursPerDay * unitValues.h;
        unitValues.w = opts.daysPerWeek * unitValues.d;
        unitValues.mth = (opts.daysPerYear / opts.monthsPerYear) * unitValues.d;
        unitValues.y = opts.daysPerYear * unitValues.d;

        return unitValues;
    }

    function getUnitKey(unit) {
        for (const key of Object.keys(UNIT_MAP)) {
            if (UNIT_MAP[key].indexOf(unit) > -1) {
                return key;
            }
        }

        throw new Error(`The unit [${unit}] is not supported by timestring`);
    }

    function getSeconds(value, unit, unitValues) {
        return value * unitValues[getUnitKey(unit)];
    }

    function convert(value, unit, unitValues) {
        return value / unitValues[getUnitKey(unit)];
    }
};