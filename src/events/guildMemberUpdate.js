const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const settings = require("../database/models/settings");

module.exports = async (bot, oldMember, newMember) => {
    // Fetch full user if partial
    // If the member is a partial fetch it
    if (newMember.partial) {
        try {
            await newMember.fetch();
        } catch (err) {
            return bot.logger.error(err);
        }
    }
    
    // Fetch guild settings
    const sets = await settings.findOne({ _id: newMember.guild.id });

    if (oldMember.pending !== newMember.pending) {
        bot.emit("guildMemberAdd", newMember);
    }

    if (sets.manual_events.members) {
        // Fetch the manual event log channel™
        const log = newMember.guild.channels.cache.get(sets.logs.events);

        // If there is no log channel, return
        if (!log)
            return;
        
        // Define the description string
        let desc = "";

        if (newMember.nickname !== oldMember.nickname) desc += `**__Nickname Updated__**\n**Old Nickname:** ${oldMember.nickname ?? "None"}\n**New Nickname:** ${newMember.nickname ?? "None"}\n\n`;
        if (JSON.stringify(newMember._roles) !== JSON.stringify(oldMember._roles)) desc += `**__Roles Updated__**\n**Old Roles:** ${oldMember.roles.cache.filter(role => role.name !== "@everyone").sort((b, a) => a.position - b.position).map(role => role.toString()).join(", ")}\n**New Roles:** ${newMember.roles.cache.filter(role => role.name !== "@everyone").sort((b, a) => a.position - b.position).map(role => role.toString()).join(", ")}`;
        if (newMember.user.tag !== oldMember.user.tag) desc += `**__Username Updated__**\n**Old Username:**${oldMember.user.tag}\n**New Username:**${newMember.user.tag}\n\n`;
        if (newMember.user.displayAvatarURL({format: "png", dynamic:true}) !== oldMember.user.displayAvatarURL({format: "png", dynamic:true})) desc += `**__Avatar Updated__**\n**Old Avatar:**[${oldMember.user.displayAvatarURL({format: "png", dynamic:true})}](Click here!)\n**New Avatar:**[${newMember.user.displayAvatarURL({format: "png", dynamic:true})}](Click here!)\n\n`;

        if (!desc)
            return;

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`${newMember.user.tag} was modified`, newMember.user.displayAvatarURL({ dynamic: true, format: "png" }))
            .setColor(newMember.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`${desc}`)
            .setFooter(`ID: ${newMember.user.id}`)
            .setTimestamp();
    
        // Send the emebed to the log channel
        log.send({ embeds: [embed] });

    }
};