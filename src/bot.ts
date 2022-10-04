import dotenv from 'dotenv';
import { Client, Collection, Partials } from 'discord.js';
import mongoose from 'mongoose';
// import Pokedex from 'pokedex-promise-v2';
import Sentry from '@sentry/node';
import { getMongooseURL, init as dbInit } from './database/mongo';

// Import handlers
import { init as commandInit } from './modules/handlers/command';
import { init as eventInit } from './modules/handlers/event';
import { INTENTS } from './modules/structures/constants';
import logger from './logger';
import { Command } from './modules/interfaces/cmd';

// Load env variables
dotenv.config();

// Create the bot client
const bot = new Client({
    allowedMentions: {
        parse: [
            'users',
        ],
    },
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.User,
    ],
    intents: INTENTS,
});

export const commands = new Collection<string, Command>();
export const tasks = new Collection<string, any>();
export const cooldowns = new Collection<string, any>();
// export const pokedex = new Pokedex();

// Initialize Mongo connection
const mongooseUrl = getMongooseURL(process.env.MONGODB_USERNAME, process.env.MONGODB_PASSWORD, process.env.MONGODB_HOST, process.env.MONGODB_PORT, process.env.MONGODB_DATABASE);
export const db = dbInit(mongooseUrl)
    .then(() => logger.debug('Successfully started DB'))
    .catch((err) => logger.error('Failed to connect to Mongo:', err));

// Init function
const init = async () => {
    if (process.env.NODE_ENV === 'development') {
        // Log the dev environment
        logger.info('== RUNNING IN DEVELOPMENT MODE ==');
        logger.info(' ');
    }

    // Send the command message and load all the commands
    logger.info('Loading commands...');
    await commandInit();

    // Update the command message
    if (commands.filter((a) => a.slash.types.chat).size > 100) {
        logger.error('Failed to load commands: Interaction command count exceeds 100.');
    } else {
        logger.info('Loaded commands.');
    }

    // Send the event message and load the events
    logger.info('Loading events');
    await eventInit(bot);

    // Update the event message
    logger.info('Loaded events');

    // Send the login message
    logger.info('Logging into the Discord API...');

    // Login to the Discord API and update the login message
    bot.login(process.env.BOT_TOKEN)
        .then(() => {
            logger.info('Logged into Discord');
        }).catch((err) => {
            logger.error('Failed to log into Discord');

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
