import { stripIndents } from 'common-tags';
import settings from '../../database/models/settings.js';
import { getChannel } from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'welcome',
        aliases: [],
        usage: 'welcome <option> [value]',
        examples: [
            'welcome channel #welcome',
            'welcome join-msg Welcome, {member}! Make sure you read our #rules',
            'welcome leave-msg Cya later {member} :wave:',
            'welcome dm Hey there, {member}! Welcome to our server :)',
            'welcome join-msg off',
        ],
        description: 'Configure the messages that are sent when Users join/leave the server',
        category: 'Settings',
        info: `Adding \`off\` after any option will clear it's data

        **__Values usable in the join, leave & DM messages__**
        \`{id}\` - The member's ID
        \`{tag}\` - The member's Tag (E.g. Waitrose#0001)
        \`{member}\` - Mentions the member who has just joined
        \`{server}\` - The Server's name
        \`{formattedCount}\` - The member's guild member number, but formatted to be "1st", "2nd", etc. (E.g. The number in which they joined at)
        \`{count}\` - The member's guild member number with no formatting (E.g. The number in which they joined at)`,
        options: [
            '`channel <channel>` - Sets the channel the join/leave message should be sent to',
            '`join-msg <message>` - The message to send when a user joins the server',
            '`leave-msg <message>` - The message to send when a user leaves the server',
            '`dm <message>` - The message to DM the user when they join the guild',
        ],
    },
    perms: {
        permission: 'ADMINISTRATOR',
        type: 'discord',
        self: [],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        if (!args[0]) {
            // If the welcome channel is no longer in the guild cache, then remove it
            if (message.settings.welcome.channel && !message.guild.channels.cache.get(message.settings.welcome.channel)) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { 'welcome.channel': null });
            }

            // Build the message content
            const msg = stripIndents`**__Welcome Settings__**

            :books: The Welcome channel is ${message.settings.welcome.channel ? `currently set to ${message.guild.channels.cache.get(message.settings.welcome.channel)}` : 'not currently set'}
            :wave: The welcome message is ${message.settings.welcome.joinMessage ? `currently set to: ${message.settings.welcome.joinMessage}` : 'not currently set'}
            :door: The leave message is ${message.settings.welcome.leaveMessage ? `currently set to: ${message.settings.welcome.leaveMessage}` : 'not currently set'}
            :speech_balloon: The welcome DM is ${message.settings.welcome.userMessage ? `currently set to: ${message.settings.welcome.userMessage}` : 'not currently set'}`;

            // Send the welcome settings message
            message.reply(msg);
        } else if (args[0].toLowerCase() === 'channel') {
            // If no channel is provided...
            if (!args[1]) {
                if (!message.settings.welcome.channel) {
                    // If there is no channel set, return such
                    return message.reply(':books: The welcome channel is not currently set');
                } if (!message.guild.channels.cache.get(message.settings.welcome.channel)) {
                    // If the guild doesn't have the channel in settings, set settings to null & return there is no channel set
                    await settings.findOneAndUpdate({ _id: message.guild.id }, { 'welcome.channel': null });
                    return message.reply(':books: The welcome channel is not currently set');
                }
                // Return the channel which is currently the welcome channel
                return message.reply(`:books: The welcome channel is currently set to ${message.guild.channels.cache.get(message.settings.welcome.channel)}`);
            }
            // Grab the Channel the user specifies from Discord
            const chan = await getChannel(message, args.slice(1).join(''), true);

            // If the channel isn't a text channel return an error
            if (chan.type !== 'GUILD_TEXT' && chan.type !== 'GUILD_NEWS') return message.errorReply('The channel you specified isn\'t a text channel!');

            // If the bot doesn't have permissions to send messages or embed in the channel return an error
            if (!chan.permissionsFor(message.guild.me).has('EMBED_LINKS') || !chan.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return message.errorReply('I don\'t have permissions to send messages or embeds in that channel!');

            // Set the channel in the guild's settings
            await settings.findOneAndUpdate({ _id: message.guild.id }, { 'welcome.channel': chan.id });
            // Send a confirmation message
            message.confirmationReply(`The welcome channel was set to ${chan}`);
        } else if (args[0].toLowerCase() === 'join-msg') {
            // If no message is specified...
            if (!args[1]) {
                if (!message.settings.welcome.joinMessage) {
                    // If there is no welcome message, return such
                    return message.reply(':wave: The welcome message is not currently set');
                }
                // Return the welcome message
                return message.reply(`:wave: The welcome message is currently set to ${message.settings.welcome.joinMessage}`);
            }
            // Ignore args[0] & join any text after the fact - Assign as "msg"
            const msg = args.slice(1).join(' ');
            // Set the new welcome message in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, { 'welcome.joinMessage': msg });
            // Send a confirmation message
            message.confirmationReply(`The join message was set to ${msg}`);
        } else if (args[0].toLowerCase() === 'leave-msg') {
            // If no message is specified...
            if (!args[1]) {
                if (!message.settings.welcome.leaveMessage) {
                    // If there is no leave message, return such
                    return message.reply(':wave: The leave message is not currently set');
                }
                // Return the leave message
                return message.reply(`:wave: The leave message is currently set to ${message.settings.welcome.leaveMessage}`);
            }
            // Ignore args[0] & join any text after the fact - Assign as "msg"
            const msg = args.slice(1).join(' ');
            // Set the new leave message in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, { 'welcome.leaveMessage': msg });
            // Send a confirmation message
            message.confirmationReply(`The leave message was set to ${msg}`);
        } else if (args[0].toLowerCase() === 'dm') {
            // If no dm is specified...
            if (!args[1]) {
                if (!message.settings.welcome.joinMessage) {
                    // If there is no welcome dm, return such
                    return message.reply(':wave: The join DM is not currently set');
                }
                // Return the welcome dm
                return message.reply(`:wave: The join DM is currently set to ${message.settings.welcome.userMessage}`);
            }
            // Ignore args[0] & join any text after the fact - Assign as "msg"
            const msg = args.slice(1).join(' ');
            // Set the new welcome dm in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, { 'welcome.userMessage': msg });
            // Send a confirmation message
            message.confirmationReply(`The join DM was set to ${msg}`);
        } else {
            return message.errorReply('Valid options are: `channel`, `join-msg`, `leave-msg` and `dm`. To view all settings, run the command with no options.');
        }
    },
};
