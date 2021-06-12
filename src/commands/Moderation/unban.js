const preban = require("../../database/models/preban");
const punishments = require("../../database/models/punishments");
const { getUser } = require("../../modules/functions/getters");
const { punishmentLog } = require("../../modules/functions/moderation");

module.exports = {
    info: {
        name: "unban",
        aliases: [],
        usage: "unban <user> [reason]",
        examples: ["unban Waitrose", "unban 420325176379703298 False ban"],
        description: "Unban a user from the server",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "BAN_MEMBERS",
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

        const bans = await message.guild.bans.fetch(),
            reason = args.slice(1).join(" ") || "No reason provided",
            match = /<@!?(\d{17,19})>/g.exec(args[0]),
            action = await punishments.countDocuments({ guild: message.guild.id }) + 1 || 1;

        // If the regex matches replace args[0]
        if (match)
            args[0] = match[1];

        // Try to find the ban
        const ban = bans.find(u => u.user.id == args[0]) 
        || bans.find(u => u.user.username.toLowerCase() == args[0].toLowerCase()) 
        || bans.find(u => u.user.id.includes(args[0]));

        if (ban) {
            // Grab the user
            const user = bot.users.cache.get(ban.user.id);
            // Unban the user
            message.guild.members.unban(ban.user.id, `[Issued by ${message.author.tag}] ${reason}`);
            // Send a confirmation message
            message.confirmation(`Successfully unbanned **${ban.user.username}#${ban.user.discriminator}**! *(Case #${action})*`);

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: message.guild.id,
                type: "unban",
                user: ban.user.id,
                moderator: message.author.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Log the unban
            punishmentLog(message, user, null, reason, "unban");
        } else {
            // Attempt to get the user
            const user = await getUser(bot, message, args[0], false);

            // If the user doesn't exist/isn't valid then return an error
            if (!user)
                message.errorReply("You did not specify a valid user");
            
            // Find the ban in the preban database
            const pban = await preban.findOne({ user: user.id });

            // If the preban database doesn't have the user, and the user doesn't exist in the guild's bans
            // then return an error
            if (!pban && !ban)
                return message.errorReply("You didn't specify a banned user!");
            
            // Find the ban in the preban database
            await preban.findOneAndDelete({ user: user.id });
            // Send a confirmation message
            message.confirmation(`Successfully unbanned **${user.tag}**! *(Case #${action})*`);
            // Log the unban
            punishmentLog(message, user, null, reason, "unban");
        }
    }
};