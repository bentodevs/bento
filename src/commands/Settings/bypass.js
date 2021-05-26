const settings = require("../../database/models/settings");
const { getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "bypass",
        aliases: [],
        usage: "bypass [role]",
        examples: [
            "bypass staff",
            "bypass staff+"
        ],
        description: "Configure roles to bypass the command blacklist.",
        category: "Settings",
        info: "This command works as a toggle. Run it again with the same role and you will remove it.\nIf you add a `+` to the end of the role it will set it as that role and all roles above it.",
        options: []
    },
    perms: {
        permission: "MANAGE_GUILD",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        if (!args[0]) {
            // If no bypass roles are set return an error
            if (!message.settings.blacklist.bypass.hierarchicRoleId && !message.settings.blacklist.bypass.roles.length)
                return message.error("Nothing other than users with the Discord Permission `ADMINISTRATOR` currently bypass the command blacklist.");

            // Define the role vars
            const hierarchicRole = message.guild.roles.cache.get(message.settings.blacklist.bypass.hierarchicRoleId),
            roles = [];

            // If the role no longer exists remove it from the db
            if (message.settings.blacklist.bypass.hierarchicRoleId && !hierarchicRole) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    "blacklist.bypass.hierarchicRoleId": null
                });
            }

            // Define the bypass settings message
            let msg = "**Bypass Settings**\n";

            if (message.settings.blacklist.bypass.roles.length) {
                // Loop through the bypass roles
                for (const data of message.settings.blacklist.bypass.roles) {
                    // Get the role
                    const role = message.guild.roles.cache.get(data);

                    if (!role) {
                        // If the role doesn't exist remove it from the database
                        await settings.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: {
                                "blacklist.bypass.roles": data
                            }
                        });
                    } else {
                        // Push the role to the array
                        roles.push(role.toString());
                    }
                }
            }

            // Add the hierarchic role to the message if it exists
            if (message.settings.blacklist.bypass.hierarchicRoleId && hierarchicRole)
                msg += `\n🎖️ Users with the ${hierarchicRole} role and up bypass the command blacklist.`;
            // Add the bypass roles to the message if they exist
            if (roles.length)
                msg += `\n${bot.config.emojis.group} The following roles bypass the command blacklist: ${roles.join(", ")}`;

            // Send the message
            message.channel.send(msg);
        } else {
            // Get the role
            const role = await getRole(message, args.join(" ")) || await getRole(message, args.join(" ").replace("+", ""));

            // If no role was found return an error
            if (!role)
                return message.error("You didn't specify a valid role!");
            // If the role is higher than or equal to the users highest role return an error
            if (message.member.roles.highest.position <= role.position)
                return message.error("That role is higher than or equal to your highest role!");

            if (args.join(" ").toLowerCase().includes("+") && (role.name.match(/\+/g) || []).length < (args.join("").match(/\+/g) || []).length) {
                // Get the db query
                const toUpdate = message.settings.blacklist.bypass.hierarchicRoleId == role.id
                    ? { "blacklist.bypass.hierarchicRoleId": null } 
                    : { "blacklist.bypass.hierarchicRoleId": role.id };

                // Update the setting in the db
                await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

                // Send a confirmation message
                message.confirmation(`The ${role} role and up will ${message.settings.blacklist.bypass.hierarchicRoleId == role.id ? "no longer" : "now"} bypass the command blacklist.`);
            } else {
                // Get the db query
                const toUpdate = message.settings.blacklist.bypass.roles.includes(role.id)
                    ? { $pull: { "blacklist.bypass.roles": role.id }}
                    : { $push: { "blacklist.bypass.roles": role.id }};

                // Update the setting in the db
                await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

                // Send a confirmation message
                message.confirmation(`Successfully ${message.settings.blacklist.bypass.roles.includes(role.id) ? "removed" : "added"} the ${role} role ${message.settings.blacklist.bypass.roles.includes(role.id) ? "from" : "to"} the bypass roles.`);
            }
        }

    }
};