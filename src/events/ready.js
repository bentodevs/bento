// Import Dependencies
const ora = require("ora");

module.exports = async bot => {
    // Send a spacer
    console.log(" ");

    // Send the ready message
    const rdyMsg = ora("Getting bot ready...").start();

    // Set the bots status
    await bot.user.setActivity(`${bot.config.general.prefix}help | r2-d2.dev`, { type: "WATCHING" });
    await bot.user.setStatus("online");

    // Stop and update the ready message
    rdyMsg.stopAndPersist({
        symbol: "✔️",
        text: ` ${bot.user.username} is online on ${bot.guilds.cache.size} servers and serving ${bot.users.cache.size} users!`
    });

    // Send a spacer
    console.log(" ");
};