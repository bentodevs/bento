import fetch from 'node-fetch';

const endpoint = 'https://graphql.anilist.co';

/**
 * Get anime or manga data from Anilist
 *
 * @param {String} title
 * @param {String} type
 *
 * @returns {Promise.<Object>}
 *
 * @example
 *
 * getMedia("Sword Art Online", "ANIME").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.log(err);
 * })
 */
export async function getMedia(title, type) {
    new Promise((resolve, reject) => {
        // Check if a type was specified otherwise set it to "ANIME"
        // eslint-disable-next-line no-param-reassign
        type = type || 'ANIME';

        // Array with the available types
        const types = [
            'ANIME',
            'MANGA',
        ];

        // If no arguments were specified return an error
        if (!title || !type) reject(new Error('Missing Args!'));
        // If an invalid type was specified return an error
        if (!types.includes(type.toUpperCase())) reject(new Error('Invalid Type!'));

        // Prepare the query
        const query = `query ($search: String, $type: MediaType) {
            Media(search: $search, type: $type, isAdult: false) {
                id
                siteUrl
                title {
                    romaji
                }
                coverImage {
                    large
                }
                description(asHtml: false)
            }
        }`;

        // Get the variables
        const variables = {
            search: title,
            type,
        };

        // Fetch the data
        fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        }).then((res) => res.json()).then((json) => {
            if (json.errors) return reject(new Error('Not Found!'));

            resolve(json.data.Media);
        }).catch((err) => {
            reject(err);
        });
    });
}

/**
 * Get character data from Anilist
 *
 * @param {String} name
 *
 * @returns {Promise.<Object>}
 *
 * @example
 *
 * getCharacter("Elaina").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.log(err);
 * })
 */
export async function getCharacter(name) {
    new Promise((resolve, reject) => {
        if (!name) reject(new Error('Missing Args!'));

        const query = `query ($search: String) {
            Character(search: $search) {
                id
                siteUrl
                name {
                    first
                    last
                }
                image {
                    large
                }
                description(asHtml: false)
            }
        }`;

        const variables = {
            search: name,
        };

        fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        }).then((res) => res.json()).then((json) => {
            if (json.errors) return reject(new Error('Not Found!'));

            resolve(json.data.Character);
        }).catch((err) => {
            reject(err);
        });
    });
}

/**
 * Get profile data from Anilist
 *
 * @param {String} username
 *
 * @returns {Promise.<Object>}
 *
 * @example
 *
 * getProfile("Jarnoo").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.log(err);
 * })
 */
export async function getProfile(username) {
    new Promise((resolve, reject) => {
        if (!username) reject(new Error('Missing Args!'));

        const query = `query ($search: String) {
            User(name: $search) {
                id
                name
                siteUrl
                avatar {
                    large
                }
                options {
                    profileColor
                }
                donatorTier
                donatorBadge
                statistics {
                    anime {
                        count
                        episodesWatched
                        minutesWatched
                        meanScore
                    }
                    manga {
                        count
                        chaptersRead
                        volumesRead
                        meanScore
                    }
                }
            }
        }`;

        const variables = {
            search: username,
        };

        fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        }).then((res) => res.json()).then((json) => {
            if (json.errors) return reject(new Error('Not Found!'));

            resolve(json.data.User);
        }).catch((err) => {
            reject(err);
        });
    });
}
