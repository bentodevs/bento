const { default: fetch } = require("node-fetch");
const config = require("../../config");

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
exports.getLeagueSummoner = async (region, summoner) => {
    // Define the list of allowed regions
    const regions = ["br", "jp", "kr", "na", "oc", "tr", "ru", "eun", "euw", "lan", "las"];
    // Set the region to lowercase - is let to allow re-assignment later
    let reg = region.toLowerCase();

    // If the region doesn't exist, then return an error
    if (!regions.includes(reg))
        return "NO_REGION";
    
    // Convert requested region in to actual region data for the API
    switch (reg) {
        case "br": reg = "BR1"; break;
        case "jp": reg = "JP1"; break;
        case "kr": reg = "KR"; break;
        case "na": reg = "NA1"; break;
        case "oc": reg = "OC1"; break;
        case "tr": reg = "TR1"; break;
        case "ru": reg = "RU"; break;
        case "eun": reg = "EUN1"; break;
        case "euw": reg = "EUW1"; break;
        case "lan": reg = "LA1"; break;
        case "las": reg = "LA2"; break;
    }

    // Fetch the base player data (This is used in future requests as some IDs are encrypted/encoded)
    const req1 = await fetch(`https://${reg}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(summoner.split(",").join(" "))}?api_key=${config.apiKeys.riot}`),
    res1 = await req1.json();
    
    // If the request doesn't return a response "200" (OK), then return an error
    if (!req1.ok)
        return "NO_USER_FOUND";
    
    // Fetch the player's match list
    const req2 = await fetch(`https://${reg}.api.riotgames.com/lol/match/v4/matchlists/by-account/${res1.accountId}?api_key=${config.apiKeys.riot}`),
    res2 = await req2.json();
    
    // Create a returnable object which can be used in commands
    const returnable = {
        user: res1.name,
        profileIconId: res1.profileIconId,
        summonerLevel: res1.summonerLevel,
        matchData: res2
    };
    
    // Return the returnable object
    return returnable;
};

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
exports.getLeagueChampByID = async (champID) => {
    // Set the champion data url
    const championData = `https://ddragon.leagueoflegends.com/cdn/11.9.1/data/en_US/champion.json`;

    // Fetch the data & convert to json
    const req = await fetch(championData),
    res = await req.json();
    
    // Convert the json data to an array of objects & kv's
    const obj = Object.values(res.data);

    // Find the request champion by ID
    const find = obj.find(c => c.key === champID.toString());

    // If we couldn't find anything, return an error
    if (!find)
        return "NO_CHAMP_FOUND";

    // If the champ was found, return it
    return find;
};

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
 exports.getLeagueChampByName = async (champName) => {
    // Set the champion data url
    const championData = `https://ddragon.leagueoflegends.com/cdn/11.9.1/data/en_US/champion.json`;

    // Fetch the data & convert to json
    const req = await fetch(championData),
    res = await req.json();
    
    // Convert the json data to an array of objects & kv's
    const obj = Object.values(res.data);

    // Find the request champion by ID
    const find = obj.find(c => c.id === champName.toTitleCase());

    // If we couldn't find anything, return an error
    if (!find)
        return "NO_CHAMP_FOUND";

    // If the champ was found, return it
    return find;
};