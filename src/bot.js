// TODO: Add proper commenting to file

// Import dependencies
const { Client } = require('discord.js'),
    { connect } = require('mongoose'),
    {stripIndents} = require('common-tags'),
    ora = require('ora');

// Import handlers
const commands = require('./modules/handlers/command'),
    events = require('./modules/handlers/event');

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

// TODO: Add all function imports

async function initialise() {
    
    // Log R2-D2 ascii art
    console.log(stripIndents`  ____  ____       ____ ____  
    |  _ \\|___ \\     |  _ \\___ \\
    | |_) | __) |____| | | |__) |
    |  _ < / __/_____| |_| / __/
    |_| \\_\\_____|    |____/_____|`);
    console.log(" ");
    console.log(" ");
    
    // TODO: Create MongoDB connection factory
    bot.mongo = await connect(bot.getMongooseURL(bot.config.db.mongo), {
        useFindAndModify: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => {
        throw new Error(err);
    });

    const commandMessage = ora("Loading commands...").start(),
        cmds = await commands.init(bot);
    
    commandMessage.stopAndPersist({
        symbol: '✔️',
        text: ` Loaded ${cmds} commands.`,
    });

    const eventMessage = ora("Loading events...").start(),
        evts = await events.init(bot);

    eventMessage.stopAndPersist({
        symbol: '✔️',
        text: ` Loaded ${evts} events.`,
    });

    const loginMessage = ora("Logging into the Discord API...").start();

    bot.login(bot.config.general.token)
        .then(() => {
            loginMessage.stopAndPersist({
                symbol: '✔️',
                text: ` Successfully logged into the Discord API!`,
            });
        }).catch(err => {
            loginMessage.stopAndPersist({
                symbol: '❌',
                text: `Error while logging into discord: ${err}`,
            });
        });
}

initialise();

process.on('SIGINT', function () {
    if (bot.mongo.connection) {
        bot.logger.log("Received SIGINT - Terminating MongoDB connection");
        bot.mongo.connection.close(function (err) {
            bot.logger.error(err);
        });
    }

    process.exit(1);
});