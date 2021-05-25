const settings = require("../../database/models/settings");
const { getMember, getUser, getChannel, getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "blacklist",
        aliases: [
            "block",
            "bl",
            "blacklists"
        ],
        usage: "blacklist [user, channel or role]",
        examples: [
            "blacklist @Waitrose",
            "blacklist #general",
            "blacklist someRole"
        ],
        description: "Configure which channels, roles or user the bot will not respond to.",
        category: "Settings",
        info: null,
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

        // Get the member, channel or role
        const member = await getMember(message, args.join(" ")) || await getUser(bot, message, args.join(" ")),
        channel = await getChannel(message, args.join(" ")),
        role = await getRole(message, args.join(" "));

        if (!args[0]) {
            // If there are no blacklists return an error
            if (!message.settings.blacklist.users.length && !message.settings.blacklist.roles.length && !message.settings.blacklist.channels.length)
                return message.error("There aren't any blacklists in this guild!");

            // Define the blacklist msg
            let msg = "__**Blacklists**__\n\n";

            if (message.settings.blacklist.users.length) {
                // Define the array
                const arr = [];

                // Loop through the users
                for (const user of message.settings.blacklist.users) {
                    // Try to get the user
                    const find = await getMember(message, user) || await getUser(bot, message, user);

                    if (!find) {
                        // If the user does not exist remove them from the db
                        await settings.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: {
                                "blacklist.users": user
                            }
                        });

                        // Push <deleted user> to the array
                        arr.push("<deleted user>");
                    } else {
                        // Push the users tag to the array
                        arr.push(find.user?.tag ?? find.tag);
                    }
                }

                // Add the users to the message
                msg += `${bot.config.emojis.users} **Users:** \`${arr.join("`, `")}\`\n`;
            }

            if (message.settings.blacklist.channels.length) {
                // Define the array
                const arr = [];

                // Loop through the channels
                for (const chan of message.settings.blacklist.channels) {
                    // Get the channel
                    const find = message.guild.channels.cache.get(chan);

                    if (!find) {
                        // If the channel does not exist remove it from the db
                        await settings.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: {
                                "blacklist.channels": chan
                            }
                        });

                        // Push <deleted channel> to the array
                        arr.push("<deleted channel>");
                    } else {
                        // Push the channel to the array
                        arr.push(find.toString());
                    }
                }

                // Add the channels to the message
                msg += `${bot.config.emojis.chatting} **Channels:** ${arr.join(", ")}\n`;
            }

            if (message.settings.blacklist.roles.length) {
                // Define the array
                const arr = [];

                // Loop through the roles
                for (const rol of message.settings.blacklist.roles) {
                    // Get the role
                    const find = message.guild.roles.cache.get(rol);

                    if (!find) {
                        // If the role does not exist remove it from the db
                        await settings.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: {
                                "blacklist.roles": rol
                            }
                        });

                        // Push <deleted role> to the array
                        arr.push("<deleted role>");
                    } else {
                        // Push the role to the array
                        arr.push(find.toString());
                    }
                }

                // Add the roles to the message
                msg += `${bot.config.emojis.group} **Roles:** ${arr.join(", ")}`;
            }

            // Send the message
            message.channel.send(msg);
        } else if (member) {
            if (message.settings.blacklist.users.includes(member.id)) {
                // Remove the user from the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $pull: {
                        "blacklist.users": member.id
                    }
                });

                // Send a confirmation message
                message.confirmation(`**${member.user?.tag ?? member.tag}** has been removed from the blacklist!`);
            } else {
                // Add the user to the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $push: {
                        "blacklist.users": member.id
                    }
                });

                // Send a confirmation message
                message.confirmation(`**${member?.user?.tag ?? member.tag}** has been added to the blacklist!`);
            }
        } else if (channel) {
            if (message.settings.blacklist.channels.includes(channel.id)) {
                // Remove the channel from the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $pull: {
                        "blacklist.channels": channel.id
                    }
                });

                // Send a confirmation message
                message.confirmation(`The ${channel} channel has been removed from the blacklist!`);
            } else {
                // If the channel isn't a text or news channel return an error
                if (channel.type !== "text" && channel.type !== "news")
                    return message.error("The channel you specified isn't a text or news channel!");

                // Add the channel to the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $push: {
                        "blacklist.channels": channel.id
                    }
                });

                // Send a confirmation message
                message.confirmation(`The ${channel} channel has been added to the blacklist!`);
            }
        } else if (role) {
            if (message.settings.blacklist.roles.includes(role.id)) {
                // If the users highest role is lower than the specified role return an error
                if (message.member.roles.highest.position <= role.position)
                    return message.error("That role is higher than or equal to your highest role!");

                // Remove the role from the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $pull: {
                        "blacklist.roles": role.id
                    }
                });

                // Send a confirmation message
                message.confirmation(`The ${role} role has been removed from the blacklist!`);
            } else {
                // If the users highest role is lower than the specified role return an error
                if (message.member.roles.highest.position <= role.position)
                    return message.error("That role is higher than or equal to your highest role!");

                // Add the role to the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $push: {
                        "blacklist.roles": role.id
                    }
                });

                // Send a confirmation message
                message.confirmation(`The ${role} role has been added to the blacklist!`);
            }
        } else {
            // Send an error
            message.error("You didn't specify a valid member, channel or role!");
        }

    }
};