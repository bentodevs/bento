const { format } = require("date-fns");
const punishments = require("../../database/models/punishments");
const { punishmentLog } = require("../../modules/functions/moderation");
const { getMember } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "kick",
        aliases: [],
        usage: "kick <user> [reason]",
        examples: ["kick @waitrose", "kick @Jarno bad developer"],
        description: "Kick a member from the server",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "KICK_MEMBERS",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // 1. Get the requested member
        // 2. Define the reason, and set a default if none was provided
        // 3. Get the ID of this action
        const member = await getMember(message, args[0], true),
            reason = args.splice(1, args.legth).join(" ") || "No reason provided",
            action = await punishments.countDocuments({ guild: message.guild.id }) + 1 || 1;
        
        // If the member doesn't exist/isn't part of the guild, then return an error
        if (!member)
            return message.error("That user is not a member of this server!");
        
        // If the member's ID is the author's ID, then return an error
        if (member.id === message.author.id)
            return message.error("You are unable to kick yourself!");
        
        // If the member's highest role is higher than the executors highest role, then return an error
        if (member.roles.highest.position >= message.member.roles.highest.position)
            return message.error("You are unable to kick those of the same or higher rank!");
        
        // If the bot cannot kick the user, then return an error
        if (!member.kickable)
            return message.error("I am not able to kick this member! *They may have a higher role than me!*");
        
        try {
            // Try and send the member a DM stating that they were kicked - Catch silently if there is an issue
            await member.send(`:hammer: You have been kicked from ** ${message.guild.name} for \`${reason}\``).catch(() => { });

            // kick the member & set the reason
            member.kick({ reason: `[Case: ${action} | ${message.author.tag} on ${format(Date.now(), 'PPp')}] ${reason}]` });

            // Send a message confirming the action
            message.confirmation(`\`${member.user.tag}\` was kicked for **${reason}** *(Case #${action})*`);

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: message.guild.id,
                type: "kick",
                user: member.id,
                moderator: message.author.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Send the punishment to the log channel
            punishmentLog(message, member, action, reason, "kick");
        } catch (e) {
            // Catch any errors during the kick process & send error message
            message.error(`There was an issue kicking \`${member.user.tag}\` - \`${e.message}\``);
        }
    }
};