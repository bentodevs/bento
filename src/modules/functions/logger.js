import chalk from 'chalk';
import { format } from 'date-fns';

export function log(content, type = 'log') {
    const timestamp = `[${format(Date.now(), 'yyyy/MM/dd HH:mm:ss')}]:`;
    switch (type) {
    case 'log': {
        return console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
    }
    case 'warn': {
        return console.warn(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
    }
    case 'error': {
        return console.error(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
    }
    case 'debug': {
        return console.debug(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
    }
    case 'cmd': {
        return console.info(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
    }
    case 'ready': {
        return console.info(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
    }
    default: throw new TypeError('Logger type must be either warn, debug, log, ready or cmd');
    }
}

export function warn(...args) { this.log(...args, 'warn'); }
export function error(...args) { this.log(...args, 'error'); }
export function debug(...args) { this.log(...args, 'debug'); }
export function cmd(...args) { this.log(...args, 'cmd'); }
export function ready(...args) { this.log(...args, 'ready'); }
