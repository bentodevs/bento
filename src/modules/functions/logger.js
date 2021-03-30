const chalk = require("chalk");
const { format } = require("date-fns");

exports.log = (content, type = "log") => {
    const timestamp = `[${format(Date.now(), "yyyy/MM/dd HH:mm:ss")}]:`;
    switch (type) {
        case "log": {
            return console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
        }
        case "warn": {
            return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
        }
        case "error": {
            return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
        }
        case "debug": {
            return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
        }
        case "cmd": {
            return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
        }
        case "ready": {
            return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
        }
        default: throw new TypeError("Logger type must be either warn, debug, log, ready, cmd, sql or error.");
    }
};

exports.warn = (...args) => this.log(...args, "warn");
exports.error = (...args) => this.log(...args, "error");
exports.debug = (...args) => this.log(...args, "debug");
exports.cmd = (...args) => this.log(...args, "cmd");
exports.ready = (...args) => this.log(...args, "ready");