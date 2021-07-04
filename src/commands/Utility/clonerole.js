const { getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "clonerole",
        aliases: [],
        usage: "clonerole <role>",
        examples: [
            "clonerole Visitor"
        ],
        description: "Creates a copy of a role with the same name, role permissions, color, etc.",
        category: "Utility",
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
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        // Fetch the role the user wants to clone
        const role = await getRole(message, args.join(" "));

        // If no role exists, then throw an error
        if (!role)
            return message.errorReply("You didn't specify a valid role!");
        
        // If the user's highest role is below the role specified, then throw an error
        if (role.position >= message.member.roles.highest.position)
            return message.error("You are unable to clone roles that are higher than, or equal to, your highest role!");
        
        // If the bot's highest role is below the role specified, then throw an error
        if (role.position >= message.guild.me.roles.highest.position)
            return message.error("I am unable to clone roles that are higher than, or equal to, my highest role!");

        // Create the role
        await message.guild.roles.create({
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions,
            mentionable: role.mentionable,
            reason: `Role cloned at the request of ${message.author.tag}`
        }).then(r => message.confirmationReply(`Successfully cloned the ${role} role to ${r} (\`${r.id}\`)!`))
        .catch(err => message.errorReply(`I encountered an error whilst cloning the ${role} role: ${err.message}`));
    }
};