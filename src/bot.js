// Import dependencies
const { Client, Collection } = require("discord.js"),
{ connect } = require("mongoose"),
{ getMongooseURL } = require("./database/mongo"),
ora = require("ora"),
Pokedex = require('pokedex-promise-v2'),
Sentry = require('@sentry/node'),
Tracing = require("@sentry/tracing");

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
    ],
    intents: [
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_BANS",
        "GUILD_EMOJIS_AND_STICKERS",
        "GUILD_WEBHOOKS",
        "GUILD_VOICE_STATES",
        "GUILD_PRESENCES",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "DIRECT_MESSAGES"
    ]
});

// Create pokedex
bot.pokedex = new Pokedex();

// Import the config
bot.config = require("./config");
// Import the logger
bot.logger = require("./modules/functions/logger");
// Import prototypes
require("./modules/functions/prototypes")();

// Create the deletedMsgs collection
bot.deletedMsgs = new Collection();
// Create the cooldowns collection
bot.cooldowns = new Collection();

// Init function
const init = async () => {
    // Log R2-D2 ascii art
    console.log(`     ____  ____       ____ ____
    |  _ \\|___ \\     |  _ \\___ \\
    | |_) | __) |____| | | |__) |
    |  _ < / __/_____| |_| / __/
    |_| \\_\\_____|    |____/_____|`);
    console.log(" ");
    console.log(" ");

    const sentryMessage = ora("Logging in to Sentry...").start();

    // Setup Sentry
    Sentry.init({
        dsn: bot.config.general.sentrydsn,
        integrations: [new Tracing.Integrations.Mongo()],
        tracesSampleRate: 1.0,
    });

    sentryMessage.stopAndPersist({
        symbol: "✔️",
        text: ` Signed in to Sentry!`,
    });

    // Send the command message and load all the commands
    const commandMessage = ora("Loading commands...").start(),
    cmds = await commands.init(bot);

    // Update the command message
    if (bot.commands.filter(a => a.slash?.enabled).size > 100) {
        commandMessage.stopAndPersist({
            symbol: "❌",
            text: `Error while loading commands: There are over 100 commands with slash commands enabled!`,
        });
    } else {
        commandMessage.stopAndPersist({
            symbol: "✔️",
            text: ` Loaded ${cmds} commands.`,
        });
    }

    // Send the event message and load the events
    const eventMessage = ora("Loading events...").start(),
    evts = await events.init(bot);

    // Update the event message
    eventMessage.stopAndPersist({
        symbol: "✔️",
        text: ` Loaded ${evts} events.`,
    });

    // Send the mongo message
    const mongoMsg = ora("Connecting to the Mongo database...").start();

    // Connect to the mongo DB
    bot.mongo = await connect(getMongooseURL(bot.config.mongo), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => {
        Sentry.captureException(err);
        throw new Error(err);
    });

    // Update the mongo message
    mongoMsg.stopAndPersist({
        symbol: "✔️",
        text: " Successfully connected to the Mongo database!"
    });

    // Send the login message
    const loginMessage = ora("Logging into the Discord API...").start();

    // Login to the Discord API and update the login message
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

            Sentry.captureException(err.stack);
        });
};

// Run the init function
init();

// Handle CTRL + C presses
process.on("SIGINT", async () => {
    // Check if there is a mongo connection and if so close it
    if (bot.mongo?.connection) {
        bot.logger.log("Received SIGINT - Terminating MongoDB connection");
        await bot.mongo.connection.close().then(() => {
            // Exit the process after closing the mongo connection
            process.exit(1);
        }).catch(err => {
            bot.logger.error(err.stack);
        });
    } else {
        // Exit the process
        process.exit(1);
    }
});