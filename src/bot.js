// TODO: Add proper commenting to file

// Import dependencies
const { Client } = require("discord.js"),
{ connect } = require("mongoose"),
{ getMongooseURL } = require("./database/mongo"),
ora = require("ora");

// Import handlers
const commands = require("./modules/handlers/command"),
events = require("./modules/handlers/event");

// Create the bot client
const bot = new Client({
    allowedMentions: {
        parse: [
            "users"
        ]
    },
    partials: [
        "CHANNEL",
        "GUILD_MEMBER",
        "MESSAGE",
        "REACTION",
        "USER"
    ]
});

// Import the config
bot.config = require("./config");
// Import the logger
bot.logger = require("./modules/functions/logger");
// Import prototypes
require("./modules/functions/prototypes")();

const init = async () => {
    // Log R2-D2 ascii art
    console.log(`     ____  ____       ____ ____  
    |  _ \\|___ \\     |  _ \\___ \\
    | |_) | __) |____| | | |__) |
    |  _ < / __/_____| |_| / __/
    |_| \\_\\_____|    |____/_____|`);
    console.log(" ");
    console.log(" ");

    const commandMessage = ora("Loading commands...").start(),
    cmds = await commands.init(bot);
    
    commandMessage.stopAndPersist({
        symbol: "✔️",
        text: ` Loaded ${cmds} commands.`,
    });

    const eventMessage = ora("Loading events...").start(),
    evts = await events.init(bot);

    eventMessage.stopAndPersist({
        symbol: "✔️",
        text: ` Loaded ${evts} events.`,
    });

    const mongoMsg = ora("Connecting to the Mongo database...").start();

    bot.mongo = await connect(getMongooseURL(bot.config.mongo), {
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => {
        throw new Error(err);
    });

    mongoMsg.stopAndPersist({
        symbol: "✔️",
        text: " Successfully connected to the Mongo database!"
    });

    const loginMessage = ora("Logging into the Discord API...").start();

    bot.login(bot.config.general.token)
        .then(() => {
            loginMessage.stopAndPersist({
                symbol: "✔️",
                text: " Successfully logged into the Discord API!",
            });
        }).catch(err => {
            loginMessage.stopAndPersist({
                symbol: "❌",
                text: `Error while logging into discord: ${err}`,
            });
        });
};

init();

process.on("SIGINT", async () => {
    if (bot.mongo?.connection) {
        bot.logger.log("Received SIGINT - Terminating MongoDB connection");
        await bot.mongo.connection.close().catch(err => {
            bot.logger.error(err.stack);
        });
    }

    process.exit(1);
});