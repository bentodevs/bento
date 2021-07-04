// Import Dependencies
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const tags = require("../database/models/tags");
const { getSettings, getPerms } = require("../database/mongo");
const { checkMessage, checkBlacklist } = require("../modules/functions/moderation");
const { getTag } = require("../modules/functions/getters");
const { checkSelf, checkPerms } = require("../modules/functions/permissions");
const afk = require("../database/models/afk");
const { checkLevel } = require("../modules/functions/leveling");

module.exports = async (bot, message) => {
    // If a message is partial try to fetch it.
    if (message.partial) {
        try {
            await message.fetch();
        } catch (err) {
            return bot.logger.error(err);
        }
    }

    // Get important options
    const prefixMention = new RegExp(`^<@!?${bot.user.id}>`),
    settings = message.settings = await getSettings(message.guild?.id),
    prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : settings.general.prefix;

    // If the channel is a command channel delete the message after 15 seconds
    if (message.settings.general.command_channel) {
        if (message.channel.id === message.settings.general.command_channel)
            setTimeout(() => message.delete().catch(() => {}), 15000);
    }

    // Return if the user is a bot
    if (message.author.bot)
        return;
    
    // If the message was sent in a guild, then check it against the automod & run the leveling function
    if (message.guild) {
        await checkMessage(message, settings);
        await checkLevel(message);
    }

    // AFK User check
    if (message.content.indexOf(prefix) !== 0) {
        if (message.mentions.users.size) {
            const first = message.mentions.users.first(),
            afkUser = await afk.findOne({ user: first.id, guild: message.guild.id });
            if (afkUser?.status && first.id !== message.author.id)
                return message.reply(`${first} is current AFK - ${afkUser.status}`);
        }
    }

    // Return if the message doesn't start with the prefix
    if (message.content.indexOf(prefix) !== 0)
        return;
    // Cache the guild member if they aren't isn't cached
    if (message.guild && !message.member) 
        await message.guild.members.fetch(message.author);

    // Get the args and the command/tag.
    const args = message.content.slice(prefix.length).trim().split(/ +/g),
    command = args.shift().toLowerCase(),
    cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command)),
    tag = message.guild ? await tags.findOne({ guild: message.guild.id, name: command }) : false;

    // Import message functions
    require("../modules/functions/messages")(message);

    // Return if the user didn't specify a valid command
    if (!cmd && !tag)
        return;

    // Return if the user is blacklisted
    if (await checkBlacklist(message))
        return;

    // If its a tag return the getTag function
    if (tag)
        return getTag(tag, message, args);

    // Get permissions
    const permissions = message.permissions = await getPerms(bot, message.guild?.id);

    // Return an error if the command is disabled and the user isn't a bot owner
    if (cmd.opts.disabled && !bot.config.general.devs.includes(message.author.id)) {
        // If disabled messages are enabled send one
        if (message.settings.general.disabled_message) {
            await message.errorReply("This command is currently disabled!");
        }

        // Return
        return;
    }
    // Return if the command is a dev only command and the user isn't a dev
    if (cmd.opts.devOnly && !bot.config.general.devs.includes(message.author.id))
        return;
    // Return the help embed if the command has noArgsHelp enabled and no args were specified
    if (cmd.opts.noArgsHelp && !args[0])
        return bot.commands.get("help").run(bot, message, [cmd.info.name]);
    // Return an error if a guild only command gets used in dms
    if (cmd.opts.guildOnly && !message.guild)
        return message.errorReply("This command is unavailable via private messages. Please run this command in a guild.");
    if (message.guild && (settings.general.disabled_commands?.includes(cmd.info.name) || settings.general.disabled_categories?.includes(cmd.info.category)) && !message.channel.permissionsFor(message.member).has("ADMINISTRATOR") && !bot.config.general.devs.includes(message.author.id)) {
        // If disabled messages are enabled send one
        if (message.settings.general.disabled_message) {
            await message.errorReply("This command (or the category the command is in) is currently disabled!");
        }

        // Return
        return;
    }

    // If the bot doesn't have permissions to run the command return
    if (await checkSelf(message, cmd))
        return;
    // If the user doesn't have permissions to run the command return
    if (await checkPerms(bot, message, permissions, cmd) && cmd.info.name !== "nick") {
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
        // Get the error guild and channel
        const guild = bot.guilds.cache.get(bot.config.logging.errors.guild) || await bot.guilds.fetch(bot.config.logging.errors.guild).catch(() => {}),
        channel = guild?.channels.cache.get(bot.config.logging.errors.channel);

        // Build the error embed
        const embed = new MessageEmbed()
            .setAuthor(`An error occured in ${message.guild?.name ?? `${message.author.tag}'s dms`}`, "https://i.imgur.com/e7xORGp.png")
            .setThumbnail("https://i.imgur.com/e7xORGp.png")
            .setDescription(stripIndents`**Guild ID:** ${message.guild?.id ?? "<dms>"}
            **Message Author:** ${message.author.tag} (${message.author.id})
            **Message ID:** [${message.id}](${message.url})
            **Command:** ${cmd.info.name}
            **Message:** ${message.content}
            
            **Error:**\`\`\`${err.stack}\`\`\``)
            .setColor("#FF2D00");

        // Send the embed
        channel?.send({ embeds: [embed] });

        // Send an error message to the user
        message.errorReply(stripIndents`An error occurred while running the command: \`${err}\`
        
        ${bot.config.emojis.url} If this issue persists please report it in our discord: ${bot.config.logging.errors.url}`);
    }

    // Log that the command has been run
    bot.logger.cmd(`${message.author.username} (${message.author.id}) ran command ${cmd.info.name}${message.guild ? ` in ${message.guild.name} (${message.guild.id})` : ""}`);
};