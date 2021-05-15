const permissions = require("../../database/models/permissions");
const { getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "perms",
        aliases: [],
        usage: "",
        examples: [],
        description: "",
        category: "Settings",
        info: null,
        options: []
    },
    perms: {
        permission: "",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Define the discord permissions
        const dPerms = bot.config.discordPermissions;

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
            return message.error("You didn't specify a valid category or command!");

        // If its a command delete the self perms
        if (command)
            delete command.perms.self;

        // Get the perm info
        let perm = message.permissions.categories[category] || message.permissions.commands[command?.info.name] || undefined;

        if (!args[1]) {
            if (JSON.stringify(perm) === JSON.stringify(command?.perms) && message.permissions.categories[command?.info.category.toLowerCase()]?.permission)
                perm = message.permissions.categories[command.info.category.toLowerCase()];
            
            // Define the perm message
            let msg = `🔒 The current permission for ${command ? `\`${message.settings.general.prefix}${command.info.name}\`` : `the \`${category}\` category`} is set to `;

            if (!perm?.type && category) {
                msg = "🔒 There is no permission set for that category";
            } else if (perm.type === "role" && perm.hierarchic) {
                // Grab the role
                const role = await getRole(message, perm.permission);

                // Add the role to the message
                msg += role.id === message.guild.id ? "be open to everyone." : `the ${role} role and up`;
            } else if (perm.type === "role" && !perm.hierarchic) {
                // Create the roles array
                const roles = [];

                // Loop through the roles
                for (const i of perm.permission) {
                    // Get the role
                    const role = await getRole(message, i);
                    // Push the role into the array
                    roles.push(role.toString());
                }

                // Add the roles to the message
                msg += `the ${roles.join(", ")} role${roles.length > 1 ? "s" : ""}`;
            } else if (perm.type === "discord") {
                // Add the permission to the message
                msg += `the Discord permission \`${perm.permission}\``;
            } else {
                msg = "🔒 There is no permission set for that category";
            }

            // Compare the objects and if they are the same add (default) to the perm message
            if (JSON.stringify(perm) === JSON.stringify(command?.perms) && message.permissions.categories[command?.info.category.toLowerCase()]?.permission)
                msg += ` (set for the \`${command.info.category}\` category)`;
            else if (command & JSON.stringify(perm) === JSON.stringify(command?.perms)) 
                msg += " (default)";
            // Otherwise add a dot
            else msg += ".";

            // Send the message
            message.channel.send(msg);
        } else if (dPerms.includes(args[1].toUpperCase())) {
            if (category) {
                if (args[1].toUpperCase() == perm?.permission)
                    return message.error(`The permission for that category is already set to \`${args[1].toUpperCase()}\`!`);

                await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                    [`permissions.categories.${category}`]: {
                        permission: args[1].toUpperCase(),
                        type: "discord"
                    }
                });

                message.confirmation(`The permission for the \`${category}\` category has successfully been set to \`${args[1].toUpperCase()}\`!`);
            } else {
                if (args[1].toUpperCase() == perm.permission)
                    return message.error(`The permission for that command is already set to \`${args[1].toUpperCase()}\`!`);

                await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                    [`permissions.commands.${command.info.name}`]: {
                        permission: args[1].toUpperCase(),
                        type: "discord"
                    }
                });

                message.confirmation(`The permission for the \`${command.info.name}\` command has successfully been set to \`${args[1].toUpperCase()}\`!`);
            }
        } else if (args[1].toLowerCase() == "default") {
            if (category) {
                if (!perm?.permission)
                    return message.error("The category is already set to the default permission!");

                await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                    [`permissions.categories.${category}`]: {}
                });

                message.confirmation(`The permission for the \`${category}\` category has been set to the default permission!`);
            } else {
                if (JSON.stringify(perm) == JSON.stringify(command.perms))
                    return message.error("The command is already set to the default permission!");

                await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                    [`permissions.commands.${command.info.name}`]: command.perms
                });

                message.confirmation(`The permission for the \`${command.info.name}\` command has been set to the default permission!`);
            }
        } else {
            const role = await getRole(message, args.slice(1).join(" ")) || await getRole(message, args.slice(1).join(" ").replace("+", "")),
            location = command ? `permissions.commands.${command.info.name}` : `permissions.categories.${category}`,
            target = command ? message.settings.general.prefix + command.info.name : category,
            type = command ? "command" : "category";

            if (!role)
                return message.error("You didn't specify a valid role!");

            if (args.slice(1).join(" ").toLowerCase().includes("+") && (role.name.match(/\+/g) || []).length < (args.slice(1).join(" ").match(/\+/g) || []).length) {
                if (role.id == perm?.permission && perm?.hierarchic)
                    return message.error(`The ${command ? "command" : "category"} is already set to the permission you specified!`);

                if (role.id == message.guild.id) {
                    await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                        [location]: {
                            permission: ["@everyone"],
                            type: "role"
                        }
                    });

                    message.confirmation(`The permission for the \`${target}\` ${type} has been set to be open to everyone!`);
                } else {
                    await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                        [location]: {
                            permission: role.id,
                            type: "role",
                            hierarchic: true
                        }
                    });

                    message.confirmation(`The permission for the \`${target}\` ${type} has been set to the ${role} role and up!`);
                }
            } else {
                if (Array.isArray(perm?.permission)) {
                    if (perm.permission.includes(role.id) || perm.permission.includes(role.name)) {
                        if (perm.permission.length == 1) {
                            await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                                [location]: command ? command.perms : {}
                            });
    
                            message.confirmation(`The permission for the \`${target}\` ${type} has been set to the default permission!`);
                        } else {
                            await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                                $pull: {
                                    [`${location}.permission`]: role.name == "@everyone" ? role.name : role.id
                                }
                            });

                            message.confirmation(`Successfully removed the ${role} role from the permissions for the \`${target}\` ${type}!`);
                        }
                    } else {
                        await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                            $push: {
                                [`${location}.permission`]: role.id
                            }
                        });

                        message.confirmation(`Successfully added the ${role} role to the permissions for the \`${target}\` ${type}!`);
                    }
                } else {
                    await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                        [location]: {
                            permission: [ role.id ],
                            type: "role"
                        }
                    });

                    message.confirmation(`Successfully added the ${role} role to the permissions for the \`${target}\` ${type}!`);
                }
            }
        }

    }
};