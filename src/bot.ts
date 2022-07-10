import dotenv from 'dotenv';
import { Client, Collection } from 'discord.js';
import mongoose from 'mongoose';
import ora from 'ora';
import Pokedex from 'pokedex-promise-v2';
import Sentry from '@sentry/node';
import { getMongooseURL, init as dbInit } from './database/mongo.js';

// Import handlers
import { init as commandInit } from './modules/handlers/command.js';
import { init as eventInit } from './modules/handlers/event.js';
import { INTENTS } from './modules/utils/constants.js';
import logger from './logger';
import { Command } from './modules/interfaces/cmd.js';

// Load env variables
dotenv.config();

// Create the bot client
const bot = new Client({
    allowedMentions: {
        parse: [
            'users'
        ],
    },
    partials: [
        'CHANNEL',
        'GUILD_MEMBER',
        'MESSAGE',
        'REACTION',
        'USER',
    ],
    intents: INTENTS,
});

export const commands = new Collection<string, Command>();
export const tasks = new Collection<string, any>();

// Initialize Mongo connection
const mongooseUrl = getMongooseURL(process.env.MONGODB_USERNAME, process.env.MONGODB_PASSWORD, process.env.MONGODB_HOST, process.env.MONGODB_PORT, process.env.MONGODB_DATABASE);
export const db = dbInit(mongooseUrl)
    .then(() => logger.debug('Successfully started DB'))
    .catch((err) => logger.error(err));

// Init function
const init = async () => {
    // Log R2-D2 ascii art
    logger.info(`     ____  ____       ____ ____
    |  _ \\|___ \\     |  _ \\___ \\
    | |_) | __) |____| | | |__) |
    |  _ < / __/_____| |_| / __/
    |_| \\_\\_____|    |____/_____|`);
    logger.info(' ');
    logger.info(' ');

    if (process.env.NODE_ENV === 'development') {
        // Log the dev environment
        logger.info('== RUNNING IN DEVELOPMENT MODE ==');
        logger.info(' ');
    }

    // Import prototypes
    (await import('./modules/utils/prototypes.js')).default();

    // Send the command message and load all the commands
    logger.info('Loading commands...')
    await commandInit();

    // Update the command message
    if (commands.filter((a) => a.slash.types.chat).size > 100) {
        logger.error('Failed to load commands: Interaction command count exceeds 100.')
    } else {
        logger.info('Loaded commands.')
    }

    // Send the event message and load the events
    logger.info('Loading events');
    await eventInit(bot);

    // Update the event message
    logger.info('Loaded events')

    // Send the mongo message
    const mongoMsg = ora('Connecting to the Mongo database...').start();

    // Update the mongo message
    mongoMsg.stopAndPersist({
        symbol: '✔️',
        text: ' Successfully connected to the Mongo database!',
    });

    // Send the login message
    const loginMessage = ora('Logging into the Discord API...').start();

    // Login to the Discord API and update the login message
    bot.login(process.env.BOT_TOKEN)
        .then(() => {
            loginMessage.stopAndPersist({
                symbol: '✔️',
                text: ' Successfully logged into the Discord API!',
            });
        }).catch((err) => {
            loginMessage.stopAndPersist({
                symbol: '❌',
                text: `Error while logging into discord: ${err}`,
            });

            Sentry.captureException(err.stack);
        });
};

// Run the init function
init();

// Handle CTRL + C presses
process.on('SIGINT', async () => {
    // Check if there is a mongo connection and if so close it
    if (mongoose.connection) {
        logger.debug('Received SIGINT - Terminating MongoDB connection');
        await mongoose.connection.close().then(() => {
            // Exit the process after closing the mongo connection
            process.exit(1);
        }).catch((err) => {
            logger.error(err.stack);
        });
    } else {
        // Exit the process
        process.exit(1);
    }
});
