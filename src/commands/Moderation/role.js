const { getMember, getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "role",
        aliases: [
            "r"
        ],
        usage: "role <member> <role>",
        examples: [
            "role me staff",
            "role Jarno owner"
        ],
        description: "Add or remove a role from a user.",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_ROLES",
        type: "discord",
        self: ["MANAGE_ROLES"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        // If the user didn't specify a role return an error
        if (!args[1])
            return message.errorReply("You didn't specify a role!");

        // Get the member and the role
        const member = args[0].toLowerCase() == "me" ? message.member : await getMember(message, args[0]),
        role = await getRole(message, args.slice(1).join(" "));

        // If an invalid member was specified return an error
        if (!member)
            return message.errorReply("You didn't specify a valid member!");
        // If an invalid role was specified return an error
        if (!role)
            return message.errorReply("You didn't specify a valid role!");
        // If the roles position is higher than or equal to the users highest role return an error
        if (message.member.roles.highest.position <= role.position)
            return message.errorReply("That role is higher than or equal to your highest role!");
        // If the roles position is higher than or equal to the bots highest role return an error
        if (message.guild.me.roles.highest.position <= role.position)
            return message.errorReply("That role is higher than or equal to my highest role!");
        // If the role is managed return an error
        if (role.managed)
            return message.errorReply("The role you specified cannot be given to users! The role is either managed by an external service or is the Nitro Booster role!");

        // If the use has the role remove it, if the user doesn't have it add it
        if (member.roles.cache.get(role.id)) {
            // Remove the role
            await member.roles.remove(role);
            // Send a confirmation message
            message.confirmationReply(`Removed the ${role} role from ${member}!`);
        } else {
            // Add the role
            await member.roles.add(role);
            // Send a confirmation message
            message.confirmationReply(`Added the ${role} role to ${member}!`);
        }

    }
};