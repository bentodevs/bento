const { Permissions } = require("discord.js");
const permissions = require("../../database/models/permissions");
const { getRole } = require("../../modules/functions/getters");
const { filterSelfPerms } = require("../../modules/functions/permissions");

module.exports = {
    info: {
        name: "perms",
        aliases: [
            "p",
            "permissions",
            "perm"
        ],
        usage: "perms <command | category> [role | discord permission | \"default\"]",
        examples: [
            "perms moderation mod",
            "perms ban mod+",
            "perms kick KICK_MEMBERS",
            "perms userinfo default"
        ],
        description: "Set or view the permissions for bot commands and categories.",
        category: "Settings",
        info: "A list of \"discord permissions\" can be found [here](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS).\n\nUse `everyone` or `@everyone` to make a command/category available to all users.",
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
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

        // Get all the command categories
        const getCategories = bot.commands.map(c => c.info.category.toLowerCase()),
        categories = getCategories.filter((item, index) => {
            return getCategories.indexOf(item) >= index;
        });

        // Get the command or category
        const command = bot.commands.get(args[0].toLowerCase()) || bot.commands.get(bot.aliases.get(args[0].toLowerCase())),
        category = categories[categories.indexOf(args[0].toLowerCase())];

        // If no command was found or the command is a dev command return an error
        if ((!command && !category) || (command?.info.category.toLowerCase() == "dev" || category == "dev"))
            return message.errorReply("You didn't specify a valid category or command!");

        // Get the perm info
        const perm = message.permissions.categories[category] || message.permissions.commands[command?.info.name] || undefined;

        // Some useful variables to make this command 3x shorter xd
        const type = command ? "command" : "category",
        location = command ? `permissions.commands.${command.info.name}` : `permissions.categories.${category}`,
        target = command ? message.settings.general.prefix + command.info.name : category;

        if (!args[1]) {
            // Get the category or command permission
            const checkCat = message.permissions.categories[command.info.category.toLowerCase()]?.permission && JSON.stringify(message.permissions.commands[command.info.name]) == JSON.stringify(filterSelfPerms(command?.perms)),
            permission = checkCat ? message.permissions.categories[command.info.category.toLowerCase()] : message.permissions.commands[command.info.name];

            // Define the perm var
            let perm = `🔒 The current permission for the \`${target}\` ${type} is set to `;

            if (!perm?.type && category) {
                perm = "🔒 There is no permission set for that category";
            } else if (permission.type == "role" && permission.hierarchic) {
                // Try to get the role
                const role = await getRole(message, permission.permission);

                // Add the data to the perm message
                perm += role?.id == message.guild.id ? "open to everyone" : `the ${role ?? "<deleted role>"} role and up`;
            } else if (permission.type == "role" && !permission.hierarchic) {
                // Define the roles array
                const roles = [];

                if (permission.permission.length == 1 && (permission.permission.includes("@everyone") || permission.permission.includes(message.guild.id))) {
                    // If the only permission in the array is the everyone role set the perm message to "open to everyone"
                    perm += `open to everyone`;
                } else {
                    // Loop through the permissions and add them to the roles array
                    for (const i of permission.permission) {
                        if (i == "@everyone" || i == message.guild.id) {
                            roles.push("@everyone");
                        } else {
                            const role = await getRole(message, i);
                            if (!role) {
                                if (permission.permission.length == 1) {
                                    await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                                        [location]: command ? filterSelfPerms(command.perms) : {}
                                    });
                                } else {
                                    await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                                        $pull: {
                                            [`${location}.permission`]: i
                                        }
                                    });
                                }

                                roles.push("<deleted role>");
                            } else {
                                roles.push(role?.toString() ?? "<deleted role>");
                            }
                        }
                    }

                    // Add the data to the perm message
                    perm += `the ${roles.join(", ")} role${roles.length > 1 ? "s" : ""}`;
                }
            } else if (permission.type == "discord") {
                // Add the data to the perm message
                perm += `the Discord permission \`${permission.permission}\``;
            } else if (command.info.category.toLowerCase() == "dev") {
                // Add the data to the perm message
                perm += `bot devs only`;
            }

            if (checkCat) {
                // If the perm is set for a category add it to the perm message
                perm += ` (set for the \`${command.info.category}\` category)`;
            } else if (JSON.stringify(permission) == JSON.stringify(filterSelfPerms(command?.perms))) {
                // If the perm is the default perm add it to the perm message
                perm += " (default)";
            } else {
                // Add a dot
                perm += ".";
            }

            // Send the message
            message.reply(perm);
        } else if (Permissions.FLAGS[args[1].toUpperCase()]) {
            // If the permission is already set to the specified permission return an error
            if (args[1].toUpperCase() == perm?.permission)
                return message.errorReply(`The permission for the \`${target}\` ${type} is already set to \`${args[1].toUpperCase()}\`!`);

            // Update the permission in the database
            await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                [location]: {
                    permission: args[1].toUpperCase(),
                    type: "discord"
                }
            });

            // Send a confirmation message
            message.confirmationReply(`The permission for the \`${target}\` ${type} has been set to \`${args[1].toUpperCase()}\`!`);
        } else if (args[1].toLowerCase() == "default") {
            // If the permission is already set to default return an error
            if (!perm?.permission || JSON.stringify(perm) == JSON.stringify(command ? filterSelfPerms(command.perms) : null))
                return message.errorReply(`The ${type} is already set to the default permission!`);

            // Update the permission in the database
            await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                [location]: command ? filterSelfPerms(command.perms) : {}
            });

            // Send a confirmation message
            message.confirmationReply(`The permission for the \`${target}\` ${type} has been set to the default permission!`);
        } else {
            // Get the role
            const role = await getRole(message, args.slice(1).join(" ")) || await getRole(message, args.slice(1).join(" ").replace("+", ""));

            // If no role was specified return an error
            if (!role)
                return message.errorReply("You didn't specify a valid role or permission!");

            if (args.slice(1).join(" ").toLowerCase().includes("+") && (role.name.match(/\+/g) || []).length < (args.slice(1).join(" ").match(/\+/g) || []).length) {
                // If the permission is already set to the role specified return an error
                if (role.id == perm?.permission && perm?.hierarchic)
                    return message.errorReply(`The ${type} is already set to the permission you specified!`);

                // Update the permission in the database
                await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                    [location]: role.id == message.guild.id ? { permission: ["@everyone"], type: "role" } : { permission: role.id, type: "role", hierarchic: true }
                });

                // Send a confirmation message
                message.confirmationReply(`The permission for the \`${target}\` ${type} has been set to ${role.id == message.guild.id ? "be open to everyone" : `the ${role} role and up`}!`);
            } else {
                if (Array.isArray(perm?.permission)) {
                    if (perm.permission.includes(role.id) || perm.permission.includes(role.name)) {
                        if (perm.permission.length == 1) {
                            // Update the permission in the database
                            await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                                [location]: command ? filterSelfPerms(command.perms) : {}
                            });

                            // Send a confirmation message
                            message.confirmationReply(`The permission for the \`${target}\` ${type} has been set to the default permission!`);
                        } else {
                            // Pull the role from the permission in the database
                            await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                                $pull: {
                                    [`${location}.permission`]: role.id == message.guild.id ? role.name : role.id
                                }
                            });

                            // Send a confirmation message
                            message.confirmationReply(`Successfully removed the ${role} role from the permissions for the \`${target}\` ${type}!`);
                        }
                    } else {
                        // Push the role to the permission in the database
                        await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                            $addToSet: {
                                [`${location}.permission`]: role.id == message.guild.id ? role.name : role.id
                            }
                        });

                        // Send a confirmation message
                        message.confirmationReply(`Successfully added the ${role} role to the permissions for the \`${target}\` ${type}!`);
                    }
                } else {
                    // Update the permission in the database
                    await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                        [location]: {
                            permission: [role.id == message.guild.id ? role.name : role.id],
                            type: "role"
                        }
                    });

                    // Send a confirmation message
                    message.confirmationReply(`Successfully added the ${role} role to the permissions for the \`${target}\` ${type}!`);
                }
            }
        }

    }
};