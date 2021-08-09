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
        enabled: true,
        opts: [{
            name: "role",
            type: "ROLE",
            description: "Select the role you want to clone.",
            required: true
        }, {
            name: "name",
            type: "STRING",
            description: "Provide a new name for the role.",
            required: false
        }]
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

    },

    run_interaction: async (bot, interaction) => {

        // Fetch the role the user wants to clone
        const role = interaction.options.get("role").role;

        // If no role exists, then throw an error
        if (!role)
            return interaction.error({content: "You didn't specify a valid role!", ephemeral: true});

        // If the user's highest role is below the role specified, then throw an error
        if (role.position >= interaction.member.roles.highest.position)
            return interaction.error("You are unable to clone roles that are higher than, or equal to, your highest role!");

        // If the bot's highest role is below the role specified, then throw an error
        if (role.position >= interaction.guild.me.roles.highest.position)
            return interaction.error("I am unable to clone roles that are higher than, or equal to, my highest role!");

        // Create the role
        await interaction.guild.roles.create({
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions,
            mentionable: role.mentionable,
            reason: `Role cloned at the request of ${interaction.user.tag}`
        }).then(r => interaction.confirmation({content: `Successfully cloned the ${role} role to ${r} (\`${r.id}\`)!`, ephemeral: true}))
        .catch(err => interaction.error({content: `I encountered an error whilst cloning the ${role} role: ${err.message}`, ephemeral: true}));
        
    }
};