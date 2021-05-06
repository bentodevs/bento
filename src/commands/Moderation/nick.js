const { getMember } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "nick",
        aliases: [
            "n"
        ],
        usage: "nick <member> [nickname]",
        examples: [
            "nick me Jarno",
            "nick me",
            "nick Waitrose nerd",
        ],
        description: "Change or reset the nickname of a member.",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_NICKNAMES",
        type: "discord",
        self: ["MANAGE_NICKNAMES"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Get the member and the nick
        const member = args[0].toLowerCase() == "me" ? message.member : await getMember(message, args[0]),
        nick = args.slice(1).join(" ");

        // If an invalid member was specified return an error
        if (!member)
            return message.error("You didn't specify a valid member!");

        // TODO: [BOT-35] Nickname permission check

        // If the members role is higher than or equal to the user running the command return an error
        if (member.roles.highest.position >= message.member.roles.highest.position && member.id !== message.author.id)
            return message.error("You don't have permissions to change that users nickname!");
        // If the bot can't manage the user return an error
        if (!member.manageable)
            return message.error(`I don't have permissions to set ${member}'s nickname!`);
        // If the nickname is longer than 32 characters return an error
        if (nick?.length > 32)
            return message.error("Nicknames cannot be longer than 32 characters!");

        if (!nick) {
            // If the user doesn't have a nickname return an error
            if (!member.nickname)
                return message.error("This user doesn't have a nickname to remove!");

            // Remove the users nickname
            await member.setNickname(member.user.username);
            // Send a confirmation message
            message.confirmation(`Removed ${member}'s nickname!`);
        } else {
            // Set the users nickname
            await member.setNickname(nick);
            // Send a confirmation message
            message.confirmation(`Set **${member.user.username}**'s nickname to ${member}!`);
        }

    }
};