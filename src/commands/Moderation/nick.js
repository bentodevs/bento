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
        premium: false,
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "user",
            type: "USER",
            description: "The user you wish to mute.",
            required: true
        }, {
            name: "nickname",
            type: "STRING",
            description: "Nickname you wish to set (Do not enter anything to remove the nickname)",
            required: false
        }]
    },

    run: async (bot, message, args) => {

        // Get the member and the nick
        const member = args[0].toLowerCase() == "me" ? message.member : await getMember(message, args[0]),
        nick = args.slice(1).join(" ");

        // If an invalid member was specified return an error
        if (!member)
            return message.errorReply("You didn't specify a valid member!");

        // TODO: [BOT-35] Nickname permission check

        // If the members role is higher than or equal to the user running the command return an error
        if (member.roles.highest.position >= message.member.roles.highest.position && member.id !== message.author.id)
            return message.errorReply("You don't have permissions to change that users nickname!");
        // If the bot can't manage the user return an error
        if (!member.manageable)
            return message.errorReply(`I don't have permissions to set ${member}'s nickname!`);
        // If the nickname is longer than 32 characters return an error
        if (nick?.length > 32)
            return message.errorReply("Nicknames cannot be longer than 32 characters!");

        if (!nick) {
            // If the user doesn't have a nickname return an error
            if (!member.nickname)
                return message.errorReply("This user doesn't have a nickname to remove!");

            // Remove the users nickname
            await member.setNickname(member.user.username);
            // Send a confirmation message
            message.confirmationReply(`Removed ${member}'s nickname!`);
        } else {
            // Set the users nickname
            await member.setNickname(nick);
            // Send a confirmation message
            message.confirmationReply(`Set **${member.user.username}**'s nickname to ${member}!`);
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the member and the nick
        const user = interaction.options.get("user"),
        nick = interaction.options.get("nickname")?.value;

        // If an invalid member was specified return an error
        if (!user.member)
            return interaction.error("You didn't specify a valid member!");

        // TODO: [BOT-35] Nickname permission check

        // If the members role is higher than or equal to the user running the command return an error
        if (user.member.roles.highest.position >= interaction.member.roles.highest.position && user.member.id !== interaction.member.id)
            return interaction.error("You don't have permissions to change that users nickname!");
        // If the bot can't manage the user return an error
        if (!user.member.manageable)
            return interaction.error(`I don't have permissions to set ${user.member}'s nickname!`);
        // If the nickname is longer than 32 characters return an error
        if (nick?.length > 32)
            return interaction.error("Nicknames cannot be longer than 32 characters!");

        if (!nick) {
            // If the user doesn't have a nickname return an error
            if (!user.member.nickname)
                return interaction.error("This user doesn't have a nickname to remove!");

            // Remove the users nickname
            await user.member.setNickname(user.user.username);
            // Send a confirmation message
            interaction.confirmation(`Removed ${user.member}'s nickname!`);
        } else {
            // Set the users nickname
            await user.member.setNickname(nick);
            // Send a confirmation message
            interaction.confirmation(`Set **${user.user.username}**'s nickname to ${user.member}!`);
        }
    }
};