import fetch from 'node-fetch';
import { xml2json } from 'xml-js';
import HttpsProxyAgent from 'https-proxy-agent';
import config from '../../config.js';

/**
 * Get a definition from the urbandictionary api
 *
 * @param {String} query
 *
 * @returns {Promise.<Object>} definition
 *
 * @example
 *
 * urban("lol").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
export const urban = (query) => new Promise((resolve, reject) => {
    // If no query was specified return an error
    if (!query) reject(new Error('Missing Args!'));

    // Define the API URL
    const URL = `https://api.urbandictionary.com/v0/define?term=${query}`;

    // Fetch the urbandictionary API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => res.json()).then((json) => {
        // If something went wrong return null
        if (json.error) return resolve(null);
        // If no results were found return null
        if (!json.list.length) return resolve(null);

        // Sort the data by thumps_up and return the result with the most thumps up
        const result = json.list.sort((a, b) => b.thumps_up - a.thumps_up)[0];

        // Remove urban dictionary formatting
        result.definition = result.definition.removeUrbanFormatting();
        result.example = result.example.removeUrbanFormatting();

        // Return the result
        return resolve(result);
    }).catch((err) => {
        // Log and reject the error
        console.error(err);
        reject(err);
    });
});

/**
 * Gets a random meme from reddit
 *
 * @returns {Promise.<Object>} Reddit Post
 *
 * @example
 *
 * getMeme().then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
export const getMeme = () => new Promise((resolve, reject) => {
    // Define all the subreddits
    const subs = [
        'memes',
        'dankmemes',
        'wholesomememes',
        'BikiniBottomTwitter',
        'funny',
    ];

    // Get a random subreddit
    const sub = subs[Math.floor(Math.random() * subs.length)];

    // Define the API URL
    const URL = `https://www.reddit.com/r/${sub}.json?sort=top&t=week&limit=100`;

    // Fetch the reddit API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => res.json()).then((json) => {
        // Filter out all the bad posts
        const filtered = json.data.children.filter((p) => !p.data.over_18 && p.data.post_hint !== 'hosted:video' && p.data.post_hint !== 'link' && p.data.post_hint !== 'self' && p.data.post_hint);

        // If no memes remain return an error
        if (!filtered.length) return reject(new Error('No Memes Found!'));

        // Get a random post
        const post = filtered[Math.floor(Math.random() * filtered.length)];

        // Return the post
        resolve(post);
    }).catch((err) => {
        // Log and reject the error
        console.error(err);
        reject(err);
    });
});

/**
 * Get weather data for a certain location
 *
 * @param {String} query
 *
 * @returns {Promise.<Object>} weather data
 *
 * @example
 *
 * getWeather("Amsterdam").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
export const getWeather = (query) => new Promise((resolve, reject) => {
    // Define the API URL
    const URL = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_TOKEN}&q=${query}`;

    // Fetch the weather API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => res.json()).then((json) => {
        if (json.error) {
            if (json.error.code === 1006) {
                // If the error is 1006 return undefined
                return resolve(undefined);
            }
            // If its any other error return a new error
            return reject(new Error(json.error.message));
        }
        // Resolve the weather data
        resolve(json);
    }).catch((err) => {
        // Log and reject the error
        console.error(err);
        reject(err);
    });
});

/**
 * Fetches a random dad joke from the icanhazdadjoke.com api
 *
 * @returns {Promise.<Object>} dad joke data
 *
 * @example
 *
 * getDadjoke().then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(data);
 * })
 */
export const getDadjoke = () => new Promise((resolve, reject) => {
    // Define the API URL
    const URL = 'https://icanhazdadjoke.com/';

    // Fetch the dadjoke API
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => res.json()).then((json) => resolve(json)).catch((err) => {
        // Log and reject the error
        console.error(err);
        reject(err);
    });
});

/**
 * Parse a timestring
 *
 * @param {string} string
 * @param {string} returnUnit
 * @param {Object} opts
 *
 * @returns {number}
 */
export const parseTime = (string, returnUnit, opts) => {
    const DEFAULT_OPTS = {
        hoursPerDay: 24,
        daysPerWeek: 7,
        weeksPerMonth: 4,
        monthsPerYear: 12,
        daysPerYear: 365,
    };

    const UNIT_MAP = {
        ms: ['ms', 'milli', 'millisecond', 'milliseconds'],
        s: ['s', 'sec', 'secs', 'second', 'seconds'],
        m: ['m', 'min', 'mins', 'minute', 'minutes'],
        h: ['h', 'hr', 'hrs', 'hour', 'hours'],
        d: ['d', 'day', 'days'],
        w: ['w', 'week', 'weeks'],
        mth: ['mon', 'mth', 'mths', 'month', 'months'],
        y: ['y', 'yr', 'yrs', 'year', 'years'],
    };

    // eslint-disable-next-line no-param-reassign
    opts = { ...DEFAULT_OPTS, ...opts || {} };

    let totalSeconds = 0;

    // eslint-disable-next-line no-shadow
    function getUnitValues(opts) {
        // eslint-disable-next-line no-shadow
        const unitValues = {
            ms: 0.001,
            s: 1,
            m: 60,
            h: 3600,
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

    // eslint-disable-next-line no-shadow
    function getSeconds(value, unit, unitValues) {
        return value * unitValues[getUnitKey(unit)];
    }

    // eslint-disable-next-line no-shadow
    function convert(value, unit, unitValues) {
        return value / unitValues[getUnitKey(unit)];
    }

    const unitValues = getUnitValues(opts);
    const groups = string
        .toLowerCase()
        .replace(/[^.\w+-]+/g, '')
        .match(/[-+]?[0-9.]+[a-z]+/g);

    if (groups === null) {
        return null;
    }

    groups.forEach((group) => {
        const value = group.match(/[0-9.]+/g)[0];
        const unit = group.match(/[a-z]+/g)[0];

        totalSeconds += getSeconds(value, unit, unitValues);
    });

    if (returnUnit) {
        return convert(totalSeconds, returnUnit, unitValues);
    }

    return totalSeconds;
};

/**
 * Fetch a steam user from the profile URL
 *
 * @param {String} username
 *
 * @returns {Promise.<Object>} Steam user data
 *
 * @example
 *
 * fetchSteamUserByName("Waitrose").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
export const fetchSteamUserByID = (user) => new Promise((resolve, reject) => {
    // Define the baseURL for fetching a user's profile
    const baseURL = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_TOKEN}&steamids=${user}`;

    fetch(baseURL)
        .then((res) => res.json())
        .then((json) => ({
            steamID: json.response.players[0].steamid,
            avatar: {
                full: json.response.players[0].avatarfull,
                icon: json.response.players[0].avatar,
            },
            profileInfo: {
                name: json.response.players[0].personaname,
            },
        }))
        .then((obj) => resolve(obj))
        .catch((err) => {
            // Reject the error
            reject(err);
        });
});

/**
 * Fetch a steam user from the profile URL
 *
 * @param {String} username
 *
 * @returns {Promise.<Object>} Steam user data
 *
 * @example
 *
 * fetchSteamUserByName("Waitrose").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(err);
 * })
 */
export const fetchSteamUserByName = (user) => new Promise((resolve, reject) => {
    // Define the baseURL for fetching a user's profile
    const baseURL = `https://steamcommunity.com/id/${user}?xml=1`;

    fetch(baseURL)
        .then((res) => res.text())
        .then((res) => JSON.parse(xml2json(res)))
        // deepcode ignore PromiseNotCaughtNode: No cause for concern, deepcode ignore ObjectConstructor: No cause for concern
        .then((json) => ({
            steamID: json.elements[0].elements[0].elements[0].text,
            avatar: {
                full: json.elements[0].elements[8].elements[0].cdata,
                icon: json.elements[0].elements[6].elements[0].cdata,
            },
            profileInfo: {
                name: json.elements[0].elements[1].elements[0].cdata,
            },
        }))
        .then((obj) => resolve(obj))
        .catch((err) => {
            // Reject the error
            reject(err);
        });
});

/**
 * Fetch an image from the waifu.pics API
 *
 * @param {String} type
 *
 * @returns {Promise.<String>} URL to the image
 */
export const fetchWaifuApi = (type) => new Promise((resolve, reject) => {
    // Define all the different available types
    const types = [
        'waifu',
        'neko',
        'shinobu',
        'megumin',
        'bully',
        'cuddle',
        'cry',
        'hug',
        'awoo',
        'kiss',
        'lick',
        'pat',
        'smug',
        'bonk',
        'yeet',
        'blush',
        'smile',
        'wave',
        'highfive',
        'handhold',
        'nom',
        'bite',
        'glomp',
        'slap',
        'kill',
        'happy',
        'wink',
        'poke',
        'dance',
        'cringe',
    ];

    // If an invalid type was specified return an error
    if (!types.includes(type.toLowerCase())) reject(new Error('Invalid type'));

    // Define the URL
    const URL = `https://api.waifu.pics/sfw/${type}`;

    // Fetch the URL
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
    }).then((res) => res.json()).then((json) => {
        // Resolve the URL
        resolve(json.url);
    }).catch((err) => {
        // Log and reject the error
        console.error(err);
        reject(err);
    });
});

/**
 * Fetches the status of a minecraft server from the R2-D2 API
 *
 * @returns {Promise.<Object>} server status
 *
 * @example
 *
 * getMinecraftStatus().then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.error(data);
 * })
 */
export const getMinecraftStatus = (ip, port) => new Promise((resolve, reject) => {
    // If no IP was specified return an error
    if (!ip) reject(new Error('Missing Arguments'));

    // Define the API URL
    // TODO: [BOT-76] Update the URL with the actual API URL
    const URL = `https://api.mcsrvstat.us/2/${ip}${port ? `:${port}` : ''}`;
    // const URL = `http://localhost:8787/status`;

    // Fetch the server status
    fetch(URL, {
        headers: {
            'content-type': 'application/json',
        },
    }).then((res) => res.json()).then((json) => {
        // Return the status
        resolve(json);
    }).catch((err) => {
        // Log and reject the error
        console.error(err);
        reject(err);
    });
});

/**
 * Get giveaway winners
 *
 * @param {Array} entries Array with giveaway entries
 * @param {Number} winners Amount of giveaway winners
 *
 * @returns {Array} Array with giveaway winners
 */
export const drawGiveawayWinners = (entries, winners) => {
    const gWinners = entries.sort(() => 0.5 - Math.random()).slice(0, winners);
    return gWinners;
};

/**
 * Get the current Discord status
 *
 * @returns {Promise.<Object>} Discord Status API Data
 */
export const getDiscordStatus = () => new Promise((resolve, reject) => {
    // Specify the API URL
    const URL = 'https://discordstatus.com/api/v2/summary.json';

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
 * Fetch an image and return the buffer
 *
 * @param {String} url
 *
 * @returns {Promise.<Buffer>} emote
 */
export const fetchEmote = (url) => new Promise((resolve, reject) => {
    // Create the proxyAgent
    const proxyAgent = new HttpsProxyAgent(config.general.proxyUrl);

    // Fetch the URL
    fetch(url, {
        agent: proxyAgent,
    }).then(async (res) => {
        // If the url didn't contain an image return an error
        if (!res.headers.get('content-type').startsWith('image')) reject(new Error("The URL or File you specified isn't an image!"));
        // If the size of the file is too big return an error
        if (res.headers.get('content-length') > 256 * 1024) reject(new Error('The emoji is too big! It must be 256KB or less.'));

        // Convert the image to a buffer and resolve it
        res.buffer().then((buff) => {
            resolve(buff);
        });
    }).catch((err) => {
        // Log the error and reject it
        console.error(err);
        reject(new Error('Something went wrong while fetching the image!'));
    });
});

/**
 * Fetch a user's LastFM Profile
 *
 * @param {Sring} user The user to fetch
 *
 * @returns {Promise.<Object>} Last.fm user
 */
export const getLastFMUser = (user) => new Promise((resolve, reject) => {
    // Define the LastFM API URL
    const URL = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${user}&api_key=${process.env.LASTFM_TOKEN}&format=json`;

    // Fetch the URL
    fetch(URL)
        .then((res) => res.json())
        .then((d) => {
            if (d?.error === 6) {
                // If the user isn't found, throw an error
                reject(new Error('User not found'));
            } else if (d?.error) {
                // If there is an unknown error, then throw and log to console
                console.error(d.error.message);
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
export const getLastFMUserHistory = (user) => new Promise((resolve, reject) => {
    const URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${process.env.LASTFM_TOKEN}&format=json`;

    const data = fetch(URL).then((res) => res.json());

    if (data?.error === 6) {
        reject(new Error('User not found'));
    } else if (data?.error) {
        console.error(data.error.message);
        reject(new Error('An unknown error occurred!'));
    } else {
        resolve(data);
    }
});

/**
 * Get the ordinal suffix for a number (E.g. "st", "nd", "rd", "th")
 *
 * @param {Number} num The number to get the suffix for
 *
 * @returns {String} The ordinal suffix for the supplied number
 */
// eslint-disable-next-line no-mixed-operators
export const getOrdinalSuffix = (num) => ['st', 'nd', 'rd'][((num + 90) % 100 - 10) % 10 - 1] || 'th';

/**
 * Get the reaction cooldown
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {User} user The user object
 * @param {String} guild The guild id strong
 *
 * @returns {Boolean} Returns false if the user isn't on cooldown otherwise returns true
 */
export const getReactCooldown = (bot, user, guild) => {
    // Check if the user is a bot dev
    if (config.general.devs.includes(user.id)) return false;

    // Check if the user is in the collection
    if (bot.cooldowns.has(`${guild}-${user.id}-reaction`)) {
        // Grab the users data
        const usr = bot.cooldowns.get(`${guild}-${user.id}-reaction`);

        // If the user is on count 10 return true
        if (usr.count >= 10) return true;

        // Update the users count
        bot.cooldowns.set(`${guild}-${user.id}-reaction`, { count: usr.count + 1 });

        // Return false
        return false;
    }
    // Set the users data
    bot.cooldowns.set(`${guild}-${user.id}-reaction`, { count: 1 });
    // Remove the user data after 15 seconds
    setTimeout(() => { bot.cooldowns.delete(`${guild}-${user.id}-reaction`); }, 15000);
};
