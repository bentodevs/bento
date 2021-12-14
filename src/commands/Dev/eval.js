import { Util as discordUtil } from 'discord.js';
import util from 'util';

export default {
    info: {
        name: 'eval',
        aliases: ['e'],
        usage: 'eval <code>',
        examples: [
            'eval 1+1',
        ],
        description: 'Runs code.',
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
        noArgsHelp: true,
        disabled: false,
    },

    run: async (bot, message, args) => {
        // Clean the eval from any confidential data
        const clean = (text) => {
            if (typeof (text) === 'string') {
                return text
                    .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                    .replace(/@/g, `@${String.fromCharCode(8203)}`)
                    .replace(bot.config.general.token, 'Access Denied');
            }

            return text;
        };

        try {
            // Get the code to eval
            const code = args.join(' ');
            // Eval the code
            // eslint-disable-next-line no-eval
            let evaled = await eval(code);

            // Inspect the code if it didn't return a string
            if (typeof (evaled) !== 'string') {
                // eslint-disable-next-line global-require
                evaled = util.inspect(evaled);
            }

            // Split the message
            const msgs = discordUtil.splitMessage(clean(evaled), { maxLength: '1800' });

            // Send the messages
            for (const data of msgs) {
                if (data === msgs[0]) {
                    message.reply(`\`\`\`${data}\`\`\``);
                } else {
                    message.channel.send(`\`\`\`${data}\`\`\``);
                }
            }
        } catch (err) {
            // Return an error if something went wrong
            message.reply(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    },
};
