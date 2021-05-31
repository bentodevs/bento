const punishments = require("../../database/models/punishments");
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

        const bans = await message.guild.fetchBans(),
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

        // If the ban wasn't found return an error
        if (!ban)
            return message.error("You didn't specify a banned user!");

        // Grab the user
        const user = bot.users.cache.get(ban.user.id);

        try {
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
        } catch (e) {
            message.error(`There was an issue unbanning \`${user.tag}\`: \`${e.message}\``);
        }
    }
};