const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const config = require("../../config");
const settings = require("../../database/models/settings");
const { log } = require("./logger");

exports.punishmentLog = async (message, member, pID, reason, type, length) => {

    // Fetch the default logger channel
    const modlog = message.guild.channels.cache.get(message.settings.logs.default);

    // If the log channel doesn't exist, then return
    if (!modlog) return;

    if (type.toLowerCase() === "mute") {
        // Built the embed
        const embed = new MessageEmbed()
            .setAuthor(`Case #${pID} | User Muted`, member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setDescription(stripIndents`**User:** ${member} (\`${member.user.tag}\`)
            **Moderator:** ${message.author} (\`${message.author.tag}\`)
            **Time:** ${length}
            **Reason:** ${reason}`)
            .setColor(message.member.displayHexColor)
            .setTimestamp()
            .setFooter(`User ID: ${member.user.id}`);
        
        // Send the completed embed
        modlog.send(embed);
    } else if (type.toLowerCase() === "unmute") {
        // Built the embed
        const embed = new MessageEmbed()
            .setAuthor(`Case #${pID} | User Unmuted`, member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setDescription(stripIndents`**User:** ${member} (\`${member.user.tag}\`)
            **Moderator:** ${message.author}
            **Reason:** ${reason}`)
            .setColor(member.displayHexColor)
            .setTimestamp()
            .setFooter(`User ID: ${member.user.id}`);
        
        // Send the completed embed
        modlog.send(embed);
    } else if (type.toLowerCase() === "ban") {
        // Built the embed
        const embed = new MessageEmbed()
            .setAuthor(`Case #${pID} | User Banned`, member.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setThumbnail(member.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setDescription(stripIndents`**User:** ${member} (\`${member.tag}\`)
            **Moderator:** ${message.author} (\`${message.author.tag}\`)
            **Time:** Forever
            **Reason:** ${reason}`)
            .setColor(message.member.displayHexColor)
            .setTimestamp()
            .setFooter(`User ID: ${member.id}`);
        
        // Send the completed embed
        modlog.send(embed);
    } else if (type.toLowerCase() === "unban") {
        // Built the embed
        const embed = new MessageEmbed()
            .setAuthor(`Case #${pID} | User Unbanned`, member.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setThumbnail(member.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setDescription(stripIndents`**User:** ${member} (\`${member.tag}\`)
            **Moderator:** ${message.author} (\`${message.author.tag}\`)
            **Reason:** ${reason}`)
            .setColor(message.member.displayHexColor)
            .setTimestamp()
            .setFooter(`User ID: ${member.id}`);
        
        // Send the completed embed
        modlog.send(embed);
    } else if (type.toLowerCase() === "kick") {
        // Built the embed
        const embed = new MessageEmbed()
            .setAuthor(`Case #${pID} | User Kicked`, member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setDescription(stripIndents`**User:** ${member} (\`${member.user.tag}\`)
            **Moderator:** ${message.author} (\`${message.author.tag}\`)
            **Reason:** ${reason}`)
            .setColor(message.member.displayHexColor)
            .setTimestamp()
            .setFooter(`User ID: ${member.user.id}`);
        
        // Send the completed embed
        modlog.send(embed);
    } else {
        return log.error(`Received invalid punishment type: ${type.toLowerCase()}`);
    }
};

exports.checkMesage = async (message, settings) => {
    if (settings.ignore.hierarchicRoleId && message.guild.roles.cache.get(settings.ignore.hierarchicRoleId).position <= message.member.roles.highest.position)
        return;
    if (settings.ignore.channels.includes(message.channel.id) || settings.ignore.roles.includes(message.member.roles.cache) || message.member.permissions.has("ADMINISTRATOR"))
        return;

    if (settings.moderation.filter?.state) {
        for (const data of settings.moderation.filter?.entires) {
            if (message.content.toLowerCase().includes(data.toLowerCase())) {
                message.delete().catch(() => { });
                await message.reply(`you are unable to say that here!`).then(m => m.delete({ timeout: 5000 })).catch(() => { });
            }
        }
    }
    
    if (settings.moderation.filter?.zalgo) {
        const zalgo = new RegExp(/[\xCC\xCD]/);
        if (zalgo.test(message.content)) {
            message.delete().catch(() => { });
            await message.reply(`you are unable to use Zalgo text here!`).then(m => m.delete({ timeout: 5000 })).catch(() => { });
        }
    }

    if (settings.moderation.no_invite) {
        const invite = new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g);

        if (invite.test(message.content)) {
            message.delete().catch(() => { });
            await message.reply(`you are unable to send invite links here!`).then(m => m.delete({ timeout: 5000 })).catch(() => { });
        }
    }

    if (settings.moderation.no_link) {
        const link = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

        if (link.test(message.content)) {
            message.delete().catch(() => { });
            await message.reply(`you are unable to send URLs here!`).then(m => m.delete({ timeout: 5000 })).catch(() => { });
        }
    }
};

/**
 * Check if the user running the command is blacklisted
 * 
 * @param {Object} message The message object from which to get certain data (Such as guild ID, etc.)
 * 
 * @returns {Promise<Boolean>} True if blacklisted, false if not blacklisted.
 */
exports.checkBlacklist = async (message) => {
    if (message.settings.blacklist.users.includes(message.author.id) || message.settings.blacklist.channels.includes(message.author.id) || message.settings.blacklist.roles.filter(a => message.member.roles.cache.has(a)).length) {
        // Define the blacklisted var
        let blacklisted = true;

        // Get the hierarchic role
        const hierarchicRole = message.guild.roles.cache.get(message.settings.blacklist.bypass.hierarchicRoleId);

        // If the hierarchic role doesn't exist anymore remove it from the settings db
        if (!hierarchicRole && message.settings.blacklist.bypass.hierarchicRoleId) {
            await settings.findOneAndUpdate({ _id: message.guild.id }, { "blacklist.bypass.hierarchicRoleId": null });

            blacklisted = false;
        }

        // If the users role is higher or equal to the hierarchic role set blacklisted to false
        if (hierarchicRole && message.member.roles.highest.position >= hierarchicRole.position)
            blacklisted = false;

        // If the user has a bypass role set blacklisted to false
        if (message.settings.blacklist.bypass.roles.length) {
            for (const data of message.settings.blacklist.bypass.roles) {
                if (message.member.roles.cache.has(data))
                    blacklisted = false;
            }
        }

        // If the user has ADMINISTRATOR permissions or is a bot dev set blacklisted to false
        if (message.member.hasPermission("ADMINISTRATOR") || config.general.devs.includes(message.author.id))
            blacklisted = false;

        // Return the blacklisted variable
        return blacklisted;
    } else {
        // Return false
        return false;
    }
};