const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
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
            .setAuthor(`Case #${pID} | User Banned`, member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setDescription(stripIndents`**User:** ${member} (\`${member.user.tag}\`)
            **Moderator:** ${message.author} (\`${message.author.tag}\`)
            **Time:** Forever
            **Reason:** ${reason}`)
            .setColor(message.member.displayHexColor)
            .setTimestamp()
            .setFooter(`User ID: ${member.user.id}`);
        
        // Send the completed embed
        modlog.send(embed);
    } else if (type.toLowerCase() === "unban") {
        // Built the embed
        const embed = new MessageEmbed()
            .setAuthor(`User Unbanned`, member.displayAvatarURL({ dynamic: true, format: 'png' }))
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