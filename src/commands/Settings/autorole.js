const settings = require("../../database/models/settings");
const { getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "autorole",
        aliases: [
            "arole",
            "joinrole",
            "jrole"
        ],
        usage: "autorole [role | \"disable\"]",
        examples: [
            "autorole members",
            "autorole newbie",
            "autorole disable"
        ],
        description: "Add, remove or show the auto roles for this guild.",
        category: "Settings",
        info: "",
        options: []
    },
    perms: {
        permission: "MANAGE_ROLES",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "view",
            type: "SUB_COMMAND",
            description: "View the auto roles for this guild."
        }, {
            name: "role",
            type: "SUB_COMMAND",
            description: "Add or remove auto roles from this guild.",
            options: [{
                name: "role",
                type: "ROLE",
                description: "The role you want to add or remove.",
                required: true
            }]
        }, {
            name: "disable",
            type: "SUB_COMMAND",
            description: "Clear all auto roles and disable the feature."
        }]
    },

    run: async (bot, message, args) => {

        if (!args[0]) {
            // Check if there are any auto roles
            if (message.settings.roles.auto.length) {
                // Define the roles array
                const roles = [];

                // Loop through the roles
                for (const data of message.settings.roles.auto) {
                    // Try to fetch the role
                    const role = await message.guild.roles.fetch(data);

                    // If the role exists add it to the array, if not remove it from the database
                    if (role) {
                        roles.push(role);
                    } else {
                        await settings.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: {
                                "roles.auto": data
                            }
                        });
                    }
                }

                // If no roles were found return an error
                if (!roles.length)
                    return message.errorReply("There aren't any auto roles setup!");

                // Send a message with the roles
                message.confirmationReply(`The following roles have been added: ${roles.join(", ")}`);
            } else {
                // Send an error message
                message.errorReply("There aren't any auto roles setup!");
            }
        } else {
            // Check if the user specified to disable the autoroles system
            if (args[0].toLowerCase().includes("disable")) {
                // Remove the roles from the database
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    "roles.auto": []
                });

                // Send a confirmation message
                message.confirmationReply("Successfully removed all auto roles!");
            } else {
                // Get the role
                const role = await getRole(message, args.join(" "));

                // If the role doesn't exist return an error
                if (!role)
                    message.errorReply("You didn't specify a valid role!");

                if (message.settings.roles.auto.includes(role.id)) {
                    // Remove the role from the database
                    await settings.findOneAndUpdate({ _id: message.guild.id }, {
                        $pull: {
                            "roles.auto": role.id
                        }
                    });

                    // Send a confirmation message
                    message.confirmationReply(`Successfully removed the ${role} role from the auto roles!`);
                } else {
                    // If the role is higher than or equal to the bots highest role return an error
                    if (message.guild.me.roles.highest.position <= role.position)
                        return message.errorReply("That role is higher than or equal to my highest role!");
                    // If the role is higher than or equal to the users highest role return an error
                    if (message.member.roles.highest.position <= role.position)
                        return message.errorReply("That role is higher than or equal to your highest role!");

                    // Add the role to the database
                    await settings.findOneAndUpdate({ _id: message.guild.id }, {
                        $addToSet: {
                            "roles.auto": role.id
                        }
                    });

                    // Send a confirmation message
                    message.confirmationReply(`Successfully added the ${role} role to the auto roles!`);
                }
            }
        }

    },

    run_interaction: async (bot, interaction) => {

        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub == "view") {
            // Check if there are any auto roles
            if (interaction.settings.roles.auto.length) {
                // Define the roles array
                const roles = [];

                // Loop through the roles
                for (const data of interaction.settings.roles.auto) {
                    // Try to fetch the role
                    const role = await interaction.guild.roles.fetch(data);

                    // If the role exists add it to the array, if not remove it from the database
                    if (role) {
                        roles.push(role);
                    } else {
                        await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                            $pull: {
                                "roles.auto": data
                            }
                        });
                    }
                }

                // If no roles were found return an error
                if (!roles.length)
                    return interaction.error("There aren't any auto roles setup!");

                // Send a message with the roles
                interaction.confirmation(`The following roles have been added: ${roles.join(", ")}`);
            } else {
                // Send an error message
                interaction.error("There aren't any auto roles setup!");
            }
        } else if (sub == "role") {
                // Get the role
                const r = interaction.options.get("role").role;

                // If the role doesn't exist return an error
                if (!r)
                    interaction.error("You didn't specify a valid role!");

                if (interaction.settings.roles.auto.includes(r.id)) {
                    // Remove the role from the database
                    await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                        $pull: {
                            "roles.auto": r.id
                        }
                    });

                    // Send a confirmation message
                    interaction.confirmation(`Successfully removed the ${r} role from the auto roles!`);
                } else {
                    // If the role is higher than or equal to the bots highest role return an error
                    if (interaction.guild.me.roles.highest.position <= r.position)
                        return interaction.error("That role is higher than or equal to my highest role!");
                    // If the role is higher than or equal to the users highest role return an error
                    if (interaction.member.roles.highest.position <= r.position)
                        return interaction.error("That role is higher than or equal to your highest role!");

                    // Add the role to the database
                    await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                        $addToSet: {
                            "roles.auto": r.id
                        }
                    });

                    // Send a confirmation message
                    interaction.confirmation(`Successfully added the ${r} role to the auto roles!`);
                }
        } else if (sub == "disable") {
            // Remove the roles from the database
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                "roles.auto": []
            });

            // Send a confirmation message
            interaction.confirmation("Successfully removed all auto roles!");
        }

    }
};