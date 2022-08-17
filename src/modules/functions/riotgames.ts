import fetch, { Response } from 'node-fetch';
import logger from '../../logger';
import { LEAGUE_DATA_DRAGON_URL } from '../structures/constants';
import { StringUtils } from '../../utils/StringUtils';

type Regions = 'br' | 'jp' | 'kr' | 'na' | 'oc' | 'tr' | 'ru' | 'eun' | 'euw' | 'lan' | 'las';

/**
 * Fetch data from the Riot API about a League player
 *
 * @param {String} region
 * @param {String} summoner
 *
 * @returns {Promise.<Object>} Player Data (Regionalised)
 *
 * @example
 *
 * const summoner = await getLeagueSummoner("euw", "WaitroseOnTop")
 * console.log(summoner)
 */
export const getLeagueSummoner = (region: Regions, summoner: string): Promise<object> => new Promise((resolve, reject) => {
    let apiRegion: string;

    // Convert requested region in to actual region data for the API
    switch (region) {
        case 'br': apiRegion = 'BR1'; break;
        case 'jp': apiRegion = 'JP1'; break;
        case 'kr': apiRegion = 'KR'; break;
        case 'na': apiRegion = 'NA1'; break;
        case 'oc': apiRegion = 'OC1'; break;
        case 'tr': apiRegion = 'TR1'; break;
        case 'ru': apiRegion = 'RU'; break;
        case 'eun': apiRegion = 'EUN1'; break;
        case 'euw': apiRegion = 'EUW1'; break;
        case 'lan': apiRegion = 'LA1'; break;
        case 'las': apiRegion = 'LA2'; break;
        default: apiRegion = 'EUW1'; break;
    }

    const summonerUrl = `https://${apiRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(summoner.split(',').join(' '))}?api_key=${process.env.RIOT_TOKEN}`;

    fetch(summonerUrl)
        .then((res: Response) => {
            if (!res.ok) return reject(new Error('No user found'));
            return res.json();
        })
        .then((json: any) => {
            fetch(`https://${apiRegion}.api.riotgames.com/lol/match/v4/matchlists/by-account/${json.accountId}?api_key=${process.env.RIOT_TOKEN}`)
                .then((res: Response) => {
                    if (!res.ok) return reject(new Error('Match data not found'));
                    return res.json();
                })
                .then((matchData) => {
                    const user = {
                        user: json.name,
                        profileIconId: json.profileIconId,
                        summonerLevel: json.summonerLevel,
                        matchData,
                    };

                    resolve(user);
                })
                .catch((err) => {
                    reject(err);
                    logger.error(err);
                });
        })
        .catch((err) => {
            reject(err);
            logger.error(err);
        });
});

/**
 *
 * @param {Number} champID
 *
 * @returns {Promise.<Object>} Champion data
 *
 * @example
 *
 * getLeagueChampById("497").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.log(err);
 * })
 */
export const getLeagueChampById = (championId: string): Promise<unknown> => new Promise((resolve, reject) => {
    fetch(LEAGUE_DATA_DRAGON_URL)
        .then((res: Response) => res.json())
        .then((data: any) => {
            const keyData = Object.values(data.data);
            const find = keyData.find((champion: any) => champion.key === championId);

            if (!find) return reject(new Error('Champion not found.'));
            return resolve(find);
        })
        .catch((err) => reject(err));
});

/**
 *
 * @param {Number} champID
 *
 * @returns {Promise.<Object>} Champion data
 *
 * @example
 *
 * getLeagueChamp("497").then(data => {
 *      console.log(data);
 * }).catch(err => {
 *      console.log(err);
 * })
 */
export const getLeagueChampByName = (championName: string): Promise<unknown> => new Promise((resolve, reject) => {
    fetch(LEAGUE_DATA_DRAGON_URL)
        .then((res: Response) => res.json())
        .then((data: any) => {
            const keyData = Object.values(data.data);
            const find = keyData.find((champion: any) => champion.id === StringUtils.toTitleCase(championName));

            if (!find) return reject(new Error('Champion nt found.'));
            return resolve(find);
        })
        .catch((err) => reject(err));
});
