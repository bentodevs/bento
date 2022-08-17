import winston from 'winston';

const logFormat = winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level.toUpperCase()}: ${message}`);

const logLevels = {
    levels: {
        fatal: 0,
        error: 10,
        warn: 20,
        info: 30,
        debug: 30,
        all: 100,
    },
};

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat,
    ),
    transports: [new winston.transports.Console()],
    levels: logLevels.levels,
    level: 'debug',
});

export default logger;
