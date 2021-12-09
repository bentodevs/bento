/* eslint-disable camelcase */
// Import Dependencies
import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import Sentry from '@sentry/node';
import { getSettings, getPerms } from '../database/mongo.js';
import { checkMessage, checkBlacklist } from '../modules/functions/moderation.js';
import { getTag, getChannel } from '../modules/functions/getters.js';
import { checkSelf, checkPerms } from '../modules/functions/permissions.js';
import { checkLevel } from '../modules/functions/leveling.js';
import tags from '../database/models/tags.js';
import afk from '../database/models/afk.js';

export default async (bot, message) => {
    // If a message is partial try to fetch it.
    if (message.partial) {
        try {
            await message.fetch();
        } catch (err) {
            return bot.logger.error(err);
        }
    }

    // Get important options
    const prefixMention = new RegExp(`^<@!?${bot.user.id}>`);
    // eslint-disable-next-line no-multi-assign, no-param-reassign
    const settings = message.settings = await getSettings(message.guild?.id);
    const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : settings.general.prefix;
    const restricted_channel = settings.general.restricted_channels.find((a) => a.id === message.channel.id);

    // If the channel is a command channel delete the message after 15 seconds
    if (message.settings.general.command_channel) {
        if (message.channel.id === message.settings.general.command_channel) setTimeout(() => message.delete().catch(() => {}), 15000);
    }

    // Restricted channels code
    if (restricted_channel && (restricted_channel.types.includes('images') || restricted_channel.types.includes('videos')) && message.author.id !== bot.user.id) {
        // If the message has content & isn't a command delete the message
        if (message.content && (!restricted_channel.types.includes('commands') || message.content.indexOf(prefix) !== 0)) return message.delete();

        // Run the restriction checks
        if (!message.attachments.size && (!restricted_channel.types.includes('commands') || message.content.indexOf(prefix) !== 0)) {
            return message.delete();
        } if (restricted_channel.types.includes('images') && restricted_channel.types.includes('videos')) {
            if (message.attachments.filter((a) => !a.contentType.startsWith('image') && !a.contentType.startsWith('video')).size > 0) message.delete();
        } else if (restricted_channel.types.includes('images')) {
            if (message.attachments.filter((a) => !a.contentType.startsWith('image')).size > 0) message.delete();
        } else if (restricted_channel.types.includes('videos')) {
            if (message.attachments.filter((a) => !a.contentType.startsWith('video')).size > 0) message.delete();
        }
    }

    // If the message was sent in a guild, then check it against the automod
    if (message.guild && !message.author.bot) {
        await checkMessage(message, settings);
    }

    // AFK User check
    if (message.content.indexOf(prefix) !== 0 && !message.author.bot) {
        if (message.mentions.users.size) {
            const first = message.mentions.users.first();
            const afkUser = await afk.findOne({ user: first.id, guild: message.guild.id });
            if (afkUser?.status && first.id !== message.author.id) return message.reply(`${first} is current AFK - ${afkUser.status}`);
        }
    }

    // Return if the message doesn't start with the prefix
    if (message.content.indexOf(prefix) !== 0) {
        // If the message is in a guild run the level check first
        if (message.guild && !message.author.bot) await checkLevel(message);

        // Return
        return;
    }
    // Cache the guild member if they aren't cached
    if (message.guild && !message.member) await message.guild.members.fetch(message.author);

    // Get the args and the command/tag.
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
    const tag = message.guild ? await tags.findOne({ guild: message.guild.id, name: command }) : false;

    // More restricted channel code
    if (restricted_channel && restricted_channel.types.includes('commands')) {
        if (!cmd && !tag && message.author.id !== bot.user.id) return message.delete();
    }

    // Return if the user is a bot
    if (message.author.bot) return;

    if (message?.guild) {
        // Run the level check
        await checkLevel(message);
    }

    // Import message functions
    // eslint-disable-next-line global-require
    (await import('../modules/functions/messages.js')).default(message);

    // Return if the user didn't specify a valid command
    if (!cmd && !tag) return;

    // Return if the user is blacklisted
    if (await checkBlacklist(message)) return;

    // If its a tag return the getTag function
    // eslint-disable-next-line no-return-await
    if (tag) return await getTag(tag, message, args);

    // Get permissions
    // eslint-disable-next-line no-multi-assign, no-param-reassign
    const permissions = message.permissions = await getPerms(bot, message.guild?.id);

    // Return an error if the command is disabled and the user isn't a bot owner
    if (cmd.opts.disabled && !bot.config.general.devs.includes(message.author.id)) {
        // If disabled messages are enabled send one
        if (message.settings.general.disabled_message) {
            await message.errorReply('This command is currently disabled!');
        }

        // Return
        return;
    }
    // Return if the command is a dev only command and the user isn't a dev
    if (cmd.opts.devOnly && !bot.config.general.devs.includes(message.author.id)) return;
    // Return the help embed if the command has noArgsHelp enabled and no args were specified
    if (cmd.opts.noArgsHelp && !args[0]) return bot.commands.get('help').run(bot, message, [cmd.info.name]);
    // Return an error if a guild only command gets used in dms
    if (cmd.opts.guildOnly && !message.guild) return message.errorReply('This command is unavailable via private messages. Please run this command in a guild.');
    if (message.guild && (settings.general.disabled_commands?.includes(cmd.info.name) || settings.general.disabled_categories?.includes(cmd.info.category)) && !message.channel.permissionsFor(message.member).has('ADMINISTRATOR') && !bot.config.general.devs.includes(message.author.id)) {
        // If disabled messages are enabled send one
        if (message.settings.general.disabled_message) {
            await message.errorReply('This command (or the category the command is in) is currently disabled!');
        }

        // Return
        return;
    }

    // If the bot doesn't have permissions to run the command return
    if (await checkSelf(message, cmd)) return;
    // If the user doesn't have permissions to run the command return
    if (await checkPerms(bot, message, permissions, cmd) && cmd.info.name !== 'nick') {
        // If permission messages are enabled send one
        if (message.settings.general.permission_message) {
            await message.errorReply("You don't have permissions to run that command!");
        }

        // Return
        return;
    }

    // Try to run the command
    try {
        // Run the command
        await cmd.run(bot, message, args);
    } catch (err) {
        // Send the error to Sentry
        Sentry.captureException(err);

        // Get the error guild and channel
        const guild = bot.guilds.cache.get(bot.config.logging.errors.guild) || await bot.guilds.fetch(bot.config.logging.errors.guild).catch(() => {});
        const channel = guild?.channels.cache.get(bot.config.logging.errors.channel);

        // Build the error embed
        const embed = new MessageEmbed()
            .setAuthor(`An error occured in ${message.guild?.name ?? `${message.author.tag}'s dms`}`, 'https://i.imgur.com/e7xORGp.png')
            .setThumbnail('https://i.imgur.com/e7xORGp.png')
            .setDescription(stripIndents`**Guild ID:** ${message.guild?.id ?? '<dms>'}
            **Message Author:** ${message.author.tag} (${message.author.id})
            **Message ID:** [${message.id}](${message.url})
            **Command:** ${cmd.info.name}
            **Message:** ${message.content}

            **Error:**\`\`\`${err.stack}\`\`\``)
            .setColor('#FF2D00');

        // Send the embed
        channel?.send({ embeds: [embed] });

        // If the bot is in a dev environment log the error as well
        if (bot.config.general.development) console.log(err);

        // Send an error message to the user
        message.errorReply(stripIndents`An error occurred while running the command: \`${err}\`

        ${bot.config.emojis.url} If this issue persists please report it in our discord: ${bot.config.logging.errors.url}`);
    }

    if (settings.logs?.commands) {
        // Get the log channel
        const channel = await getChannel(message, settings.logs.commands, false);

        // Build the log embed
        const embed = new MessageEmbed()
            .setAuthor(`${message.author.tag} used a command in #${message.channel.name}`, message.author.displayAvatarURL({ format: 'png', dynamic: true }))
            .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true }))
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`**User:** ${message.author} (\`${message.author.id}\`)
            **Message ID:** \`${message.id}\`

            **Command:** ${cmd.info.name}
            **Message:** ${message.content}`)
            .setTimestamp();

        channel?.send({ embeds: [embed] });
    }

    // Log that the command has been run
    bot.logger.cmd(`${message.author.username} (${message.author.id}) ran command ${cmd.info.name}${message?.guild ? ` in ${message.guild.name} (${message.guild.id})` : ''}`);
};
