import { formatDistanceToNowStrict } from 'date-fns';
import premiumGuild from '../../database/models/premiumGuild.js';
import { parseTime } from '../../modules/functions/misc.js';

export default {
    info: {
        name: 'givepremium',
        aliases: ['givepro', 'obamacare'],
        usage: 'givepremium <timeframe | "forever"> [server id]',
        examples: [],
        description: 'Give a server premium',
        category: 'Dev',
        info: "In the words of Bill and Ted: 'Don't be a dick'",
        options: [],
    },
    perms: {
        permission: 'dev',
        type: '',
        self: [],
    },
    opts: {
        guildOnly: true,
        devOnly: true,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        // 1. Fetch the server specified, or current one if none specified
        // 2. Fetch the server from the premiumGuild database
        const server = bot.guilds.cache.get(args[1] ?? message.guild.id);
        const guild = await premiumGuild.findOne({ _id: server.id });

        // Define time
        let time;

        // Set time to forever if forever is specified
        if (args[0].toLowerCase() === 'forever') time = 'forever';
        // Convert a specified time to milliseconds
        if (args[0].toLowerCase() !== 'forever') time = parseTime(args[0], 'ms');

        // Reject if below 1 month
        if (time < 2628000000) return message.errorReply('The minimum time for premium access is 1 month!');

        // If the time is a number, then add time diff to current date
        if (parseInt(time, 10)) time = Date.now() + time;

        // If there is no server found, then return
        if (!server) return message.errorReply("I couldn't find a server with that ID!");

        if (guild) {
            // If the server is already premium, then fail
            if (guild?.expiry > Date.now()) return message.errorReply('This guild already has access to premium!');

            // Update premium set
            await premiumGuild.findOneAndUpdate({ _id: message.guild.id }, {
                active: true,
                activatedBy: message.author.id,
                expiry: time,
            });

            // Send confirmation message
            message.confirmationReply(`Successfully granted R2-D2 Premium to ${server.name} ${time === 'forever' ? '**forever**' : `for **${formatDistanceToNowStrict(time)}**`}`);
        } else {
            // Create the guild in the premium DB
            await premiumGuild.create({
                _id: server.id,
                active: true,
                activatedBy: message.author.id,
                expiry: time,
            });

            // Send confirmation message
            message.confirmationReply(`Successfully granted R2-D2 Premium to ${server.name} ${time === 'forever' ? '**forever**' : `for **${formatDistanceToNowStrict(time)}**`}`);
        }
    },
};
