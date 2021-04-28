const { default: fetch } = require("node-fetch");

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