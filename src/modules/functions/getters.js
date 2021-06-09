const { MessageEmbed } = require("discord.js");
const config = require("../../config");

/**
 * Gets a guild member from the cache/fetches it from the Discord API
 * 
 * @param {Object} message The message object from which to get certain data (Such as guild ID, etc.)
 * @param {String} args The provided search terms for which to lookup a member
 * @param {Boolean} noArgsAuthor Whether we can return the author, if no other member was found
 * 
 * @returns {Promise.<Object|Boolean>} Either the guild member, or false if no match could be found 
 */
exports.getMember = async (message, args, noArgsAuthor) => {
    // If no args were supplied and noArgsAuthor is true, resolve as the member that sent the msg
    if (!args && noArgsAuthor)
        return message.member;

    // Check the arguments for a mention
    const match = /<@!?(\d{17,19})>/g.exec(args);

    // Try to grab the member
    let target = message.guild.members.cache.get(args) ||
        message.guild.members.cache.find(m => m.user.username.toLowerCase() === args.toLowerCase()) ||
        message.guild.members.cache.find(m => m.user.username.toLowerCase().includes(args.toLowerCase())) ||
        message.guild.members.cache.find(m => m.displayName.toLowerCase() === args.toLowerCase()) ||
        message.guild.members.cache.find(m => m.displayName.toLowerCase().includes(args.toLowerCase())) ||
        await message.guild.members.fetch(args).catch(() => {});

    // Grab the user mention
    if (match) {
        target = message.guild.members.cache.get(match[1]) ||
            await message.guild.members.fetch(match[1]).catch(() => {});
    }

    // Return the member if one was found
    if (target) return target;

    // Check if the user may have tried to specify the users discriminator
    if (args.toLowerCase().includes("#")) {
        // Split the username and the discriminator into an array
        const check = args.toLowerCase().split("#");

        // If nothing came after the # return
        if (!check[1])
            return false;

        // Try to grab the member
        target = message.guild.members.cache.find(m => m.user.username.toLowerCase() === check[0] && m.user.discriminator === check[1]);

        // Return the member if one was found
        if (target) return target;

        // Return false if nothing was found
        return false;
    }

    // Return false if nothing was found
    return false;
};

/**
 * Gets a Discord User from the cache/fetches it from the Discord API
 * 
 * @param {Object} bot The client that instantiated this request
 * @param {Object} message The message object from which to get certain data (Such as guild ID, etc.)
 * @param {String} args The provided search terms for which to lookup a user
 * @param {Boolean} noArgsAuthor Whether we can return the author, if no other member was found
 * 
 * @returns {Promise.<Object|Boolean>} Either the user, or false if no match could be found 
 */
exports.getUser = async (bot, message, args, noArgsAuthor) => {
    // If no args were specified and noArgsAuthor is true return the author
    if (!args && noArgsAuthor)
        return message.author;

    // Try to grab the user
    let target = await (bot.users.cache.get(args) ||
        bot.users.cache.find(m => m.username.toLowerCase() === args.toLowerCase()) ||
        bot.users.cache.find(m => m.username.toLowerCase().includes(args.toLowerCase())) ||
        bot.users.fetch(args).catch(() => { }));

    // Return the user if one was found
    if (target) return target;

    if (args.toLowerCase().includes("#")) {
        // Split the username and the discriminator into an array
        const check = args.toLowerCase().split("#");

        // If nothing came after the # return
        if (!check[1])
            return false;

        // Try to grab the user
        target = bot.users.cache.find(m => m.username.toLowerCase() === check[0] && m.discriminator === check[1]);

        // Return the user if one was found
        if (target) return target;

        // Return false if nothing was found
        return false;
    }

    // Return false if nothing was found
    return false;
};

/**
 * Gets a guild channel from the cache/fetches it from the Discord API
 * 
 * @param {Object} message The message object from which to get certain data (Such as guild ID, etc.)
 * @param {String} args The provided search terms for which to lookup a channel
 * @param {Boolean} noArgsChannel Whether we can return the author, if no other member was found
 * 
 * @returns {Promise.<Object|Boolean>} Either the guild channel, or false if no match could be found 
 */
exports.getChannel = async (message, args, noArgsChannel) => {
    // If no args were specified and noArgsChannel is true return the current channel
    if (!args && noArgsChannel)
        return message.channel;

    // If no args were specified return false
    if (!args)
        return false;

    // Check for channel mentions
    const match = /<#(\d{17,19})>/g.exec(args);

    // Try to grab the channel
    let channel = await (message.guild.channels.cache.get(args) ||
        message.guild.channels.cache.find(r => r.name.toLowerCase() === args.toLowerCase()) ||
        message.guild.channels.cache.find(r => r.name.toLowerCase().includes(args.toLowerCase())));

    // Grab the channel mention
    if (match)
        channel = message.guild.channels.cache.get(match[1]);

    // If the channel is in a different guild return false
    if (channel?.guild?.id !== message.guild?.id)
        return false;
    // If a channel was found return it
    if (channel)
        return channel;
    // If no channel was found return false
    else if (!channel)
        return false;
};

/**
 * Gets a guild role from the cache/fetches it from the Discord API
 * 
 * @param {Object} message The message object from which to get certain data (Such as guild ID, etc.)
 * @param {String} args The provided search terms for which to lookup a role
 * 
 * @returns {Promise.<Object|Boolean>} Either the role, or false if no match could be found 
 */
exports.getRole = async (message, args) => {
    // If no args were specified return false
    if (!args)
        return false;

    // Role mention regex
    const match = /<@&(\d{17,19})>/g.exec(args);

    // Try to grab the role
    let role = await (message.guild.roles.cache.get(args) ||
        message.guild.roles.cache.find(r => r.name.toLowerCase() === args.toLowerCase()) ||
        message.guild.roles.cache.find(r => r.name.toLowerCase().includes(args.toLowerCase())) ||
        message.guild.roles.fetch(args).catch(() => { }));

    // Grab the role mention
    if (match)
        role = message.guild.roles.cache.get(match[1]);

    // If a role was found return it
    if (role)
        return role;
    // If no role was found return false
    else if (!role)
        return false;
};

/**
 * Formats and executes the tag
 * 
 * @param {Object} tag The tag data
 * @param {Object} message The message object from which to get certain data (Such as guild ID, etc.)
 * @param {Array} args An array of arguments taken from the message content
 * 
 * @returns {Boolean} true 
 */
exports.getTag = async (tag, message, args) => {
    // Replace all the placeholders
    let content = tag.content
        .replace(/{author}/gi, message.author)
        .replace(/{prefix}/gi, message.settings.general.prefix)
        .replace(/{guild}/gi, message.guild.name)
        .replace(/{mention}/gi, await this.getMember(message, args[0] ? args.join(" ") : false, true).then(member => { return member; }) ?? message.author );

    // If the tag includes "-e" convert it to an embed
    if (content.includes("-e")) {
        const embed = new MessageEmbed()
            .setDescription(content.replace("-e", ""))
            .setColor(message.member?.displayColor ?? config.general.embedColor);

        content = embed;
    }

    // Send the tag
    await message.channel.send(content);

    // Return true
    return true;
};