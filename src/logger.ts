import dotenv from 'dotenv';
import winston from 'winston';
import LokiTransport from 'winston-loki';

const logFormat = winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level.toUpperCase()}: ${message}`);

// Load env variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const logLevels = {
    levels: {
        fatal: 0,
        error: 10,
        warn: 20,
        info: 30,
        debug: 90,
        all: 100,
    },
};

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat,
    ),
    transports: [
        new winston.transports.Console(),
        new LokiTransport({
            host: process.env.LOKI_URL,
            basicAuth: process.env.LOKI_AUTH,
            labels: {
                src: `bento-app-${process.env.NODE_ENV}`,
            },
            batching: false
        })
    ],
    levels: logLevels.levels,
    level: 'debug',
});

export default logger;
