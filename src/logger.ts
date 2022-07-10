import winston from "winston";

const logFormat = winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level.toUpperCase()}: ${message}`);

const logLevels = {
    levels: {
        fatal: 100,
        error: 90,
        warn: 80,
        info: 70,
        debug: 60,
        all: 0
    }
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