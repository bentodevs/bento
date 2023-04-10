import dotenv from 'dotenv';
import { Client, Collection, Partials } from 'discord.js';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import * as Tracing from '@sentry/tracing';
import { init as dbInit } from './database/mongo';

// Import handlers
import { init as commandInit } from './modules/handlers/command';
import { init as eventInit } from './modules/handlers/event';
import { INTENTS, SENTRY_DSN } from './data/constants';
import logger from './logger';
import { Command } from './modules/interfaces/cmd';

// Load env variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

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
export const tasks = new Collection<string, NodeJS.Timer>();
export const cooldowns = new Collection<string, { count: number }>();

// Initialize Mongo connection
export const db = dbInit(process.env.MONGODB_URI)
    .then(() => logger.debug('Successfully started DB'))
    .catch((err) => {
        Sentry.captureException(err);
        logger.error('Failed to connect to Mongo:', err);
    });

// Init function
const init = async () => {
    Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 1.0,
        integrations: [
            new Tracing.Integrations.Mongo({
                useMongoose: true
            }),
            new RewriteFrames({
                root: global.__dirname,
            })
        ]
    });

    if (process.env.NODE_ENV === 'development') {
        // Log the dev environment
        logger.debug('== RUNNING IN DEVELOPMENT MODE ==');
    }

    // Send the command message and load all the commands
    logger.info('Loading commands...');
    await commandInit();

    // Update the command message
    if (commands.filter((a) => a.slash.types.chat).size > 100) {
        Sentry.captureException('Too many application commands commands');
        logger.error('Failed to load commands: Interaction command count exceeds 100.');
    } else {
        logger.info('Loaded commands.');
    }

    // Send the event message and load the events
    logger.debug('Loading events');
    await eventInit(bot);

    // Update the event message
    logger.debug('Loaded events');

    // Send the login message
    logger.info('Authenticating against Discord API...');

    // Login to the Discord API and update the login message
    bot.login(process.env.BOT_TOKEN)
        .then(() => {
            logger.info('Authenticated against Discord API');
        }).catch((err) => {
            logger.error('Failed to log into Discord');
            Sentry.captureException(err);
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
            Sentry.captureException(err);
            logger.error(err.stack);
        });
    } else {
        // Exit the process
        process.exit(1);
    }
});
