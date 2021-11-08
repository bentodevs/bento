module.exports = {
    info: {
        name: 'restart',
        aliases: ['reboot', 'suicide'],
        usage: '',
        examples: [],
        description: 'Restart the bot.',
        category: 'Dev',
        info: null,
        options: [],
    },
    perms: {
        type: 'dev',
        self: [],
    },
    opts: {
        guildOnly: false,
        devOnly: true,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },

    run: async (bot, message) => {
        // Send a confirmation message
        await message.confirmationReply('Alright I will be right back, *I hope....*');

        // If mongo is connected close the connection
        if (bot.mongo?.connection) {
            await bot.mongo.connection.close().catch((err) => {
                bot.logger.error(err.stack);
            });
        }

        // Kill the bot
        process.exit(0);
    },
};
