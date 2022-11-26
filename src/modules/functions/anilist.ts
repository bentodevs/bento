import { request } from "undici";

const endpoint = 'https://graphql.anilist.co';
type MediaType = 'ANIME' | 'MANGA'

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
export const getMedia = (title: string, type: MediaType): Promise<object> => new Promise((resolve, reject) => {
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
    request(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables }),
    }).then((res) => res.body.json()).then((json: any) => {
        if (json.errors) return reject(new Error('Not Found!'));

        return resolve(json.data.Media);
    }).catch((err: Error) => {
        reject(err);
    });
});

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
export const getCharacter = (name: string): Promise<object> => new Promise((resolve, reject) => {
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

    request(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables }),
    }).then((res) => res.body.json()).then((json: any) => {
        if (json.errors) return reject(new Error('Not Found!'));

        resolve(json.data.Character);
    }).catch((err) => {
        reject(err);
    });
});

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
export const getProfile = (username: string): Promise<object> => new Promise((resolve, reject) => {
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

    request(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables }),
    }).then((res) => res.body.json()).then((json: any) => {
        if (json.errors) return reject(new Error('Not Found!'));

        resolve(json.data.User);
    }).catch((err) => {
        reject(err);
    });
});
