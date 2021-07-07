// Import Dependencies
const ora = require("ora");
const { register } = require("../modules/handlers/command");
const { init } = require("../modules/handlers/task");

module.exports = async bot => {
    // Send task message and load the tasks
    const taskMsg = ora("Loading Tasks...").start(),
    loadedTasks = await init(bot);

    // Stop and update the task message
    taskMsg.stopAndPersist({
        symbol: "✔️",
        text: ` Loaded ${loadedTasks} tasks.`
    });

    // Send a spacer
    console.log(" ");

    // Send the ready message
    const rdyMsg = ora("Getting bot ready...").start();

    // Set the bots status
    await bot.user.setPresence({ activities: [{ name: `${bot.config.general.prefix}help | r2-d2.dev`, type: "WATCHING" }], status: "online"});
    // Register all the slash commands
    await register(bot);

    // Stop and update the ready message
    rdyMsg.stopAndPersist({
        symbol: "✔️",
        text: ` ${bot.user.username} is online on ${bot.guilds.cache.size} servers and serving ${bot.users.cache.size} users!`
    });

    // Send a spacer
    console.log(" ");
};