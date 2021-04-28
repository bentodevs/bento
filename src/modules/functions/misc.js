const { default: fetch } = require("node-fetch");

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
        // Define the endpoint
        const endpoint = "https://api.urbandictionary.com/v0/";

        // If no query was specified return an error
        if (!query)
            return new Error("Missing Args!");

        // Fetch the urbandictionary api
        fetch(`${endpoint}define?term=${query}`, {
            headers: { "content-type": "application/json" }
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
        // Define the endpoint
        const endpoint = "https://www.reddit.com/";
        
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

        // Fetch the reddit api
        fetch(`${endpoint}r/${sub}.json?sort=top&t=week&limit=100`, {
            headers: { "content-type": "application/json" }
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