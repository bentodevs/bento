import settings from '../../database/models/settings.js';
import {
    getMember, getUser, getChannel, getRole,
} from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'blacklist',
        aliases: [
            'block',
            'bl',
            'blacklists',
        ],
        usage: 'blacklist [user, channel or role]',
        examples: [
            'blacklist @Waitrose',
            'blacklist #general',
            'blacklist someRole',
        ],
        description: 'Configure which channels, roles or user the bot will not respond to.',
        category: 'Settings',
        info: null,
        options: [],
    },
    perms: {
        permission: 'MANAGE_GUILD',
        type: 'discord',
        self: [],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'view',
            type: 'SUB_COMMAND',
            description: 'View the current blacklist settings.',
        }, {
            name: 'channel',
            type: 'SUB_COMMAND',
            description: 'Blacklist or unblacklist channels.',
            options: [{
                name: 'channel',
                type: 'CHANNEL',
                description: 'The channel you want to (un)blacklist',
                required: true,
            }],
        }, {
            name: 'user',
            type: 'SUB_COMMAND',
            description: 'Blacklist or unblacklist users.',
            options: [{
                name: 'user',
                type: 'USER',
                description: 'The user you want to (un)blacklist',
                required: true,
            }],
        }, {
            name: 'role',
            type: 'SUB_COMMAND',
            description: 'Blacklist or unblacklist roles.',
            options: [{
                name: 'role',
                type: 'ROLE',
                description: 'The role you want to (un)blacklist',
                required: true,
            }],
        }],
    },

    run: async (bot, message, args) => {
        // Get the member, channel or role
        const member = await getMember(message, args.join(' ')) || await getUser(bot, message, args.join(' '));
        const channel = await getChannel(message, args.join(' '));
        const role = await getRole(message, args.join(' '));

        if (!args[0]) {
            // If there are no blacklists return an error
            if (!message.settings.blacklist.users.length && !message.settings.blacklist.roles.length && !message.settings.blacklist.channels.length) return message.errorReply("There aren't any blacklists in this guild!");

            // Define the blacklist msg
            let msg = '__**Blacklists**__\n\n';

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
                                'blacklist.users': user,
                            },
                        });

                        // Push <deleted user> to the array
                        arr.push('<deleted user>');
                    } else {
                        // Push the users tag to the array
                        arr.push(find.user?.tag ?? find.tag);
                    }
                }

                // Add the users to the message
                msg += `${bot.config.emojis.users} **Users:** \`${arr.join('`, `')}\`\n`;
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
                                'blacklist.channels': chan,
                            },
                        });

                        // Push <deleted channel> to the array
                        arr.push('<deleted channel>');
                    } else {
                        // Push the channel to the array
                        arr.push(find.toString());
                    }
                }

                // Add the channels to the message
                msg += `${bot.config.emojis.chatting} **Channels:** ${arr.join(', ')}\n`;
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
                                'blacklist.roles': rol,
                            },
                        });

                        // Push <deleted role> to the array
                        arr.push('<deleted role>');
                    } else {
                        // Push the role to the array
                        arr.push(find.toString());
                    }
                }

                // Add the roles to the message
                msg += `${bot.config.emojis.group} **Roles:** ${arr.join(', ')}`;
            }

            // Send the message
            message.reply(msg);
        } else if (member) {
            if (message.settings.blacklist.users.includes(member.id)) {
                // Remove the user from the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $pull: {
                        'blacklist.users': member.id,
                    },
                });

                // Send a confirmation message
                message.confirmationReply(`**${member.user?.tag ?? member.tag}** has been removed from the blacklist!`);
            } else {
                // Add the user to the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $push: {
                        'blacklist.users': member.id,
                    },
                });

                // Send a confirmation message
                message.confirmationReply(`**${member?.user?.tag ?? member.tag}** has been added to the blacklist!`);
            }
        } else if (channel) {
            if (message.settings.blacklist.channels.includes(channel.id)) {
                // Remove the channel from the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $pull: {
                        'blacklist.channels': channel.id,
                    },
                });

                // Send a confirmation message
                message.confirmationReply(`The ${channel} channel has been removed from the blacklist!`);
            } else {
                // If the channel isn't a text or news channel return an error
                if (channel.type !== 'GUILD_TEXT' && channel.type !== 'GUILD_NEWS') return message.errorReply("The channel you specified isn't a text or news channel!");

                // Add the channel to the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $push: {
                        'blacklist.channels': channel.id,
                    },
                });

                // Send a confirmation message
                message.confirmationReply(`The ${channel} channel has been added to the blacklist!`);
            }
        } else if (role) {
            if (message.settings.blacklist.roles.includes(role.id)) {
                // If the users highest role is lower than the specified role return an error
                if (message.member.roles.highest.position <= role.position) return message.errorReply('That role is higher than or equal to your highest role!');

                // Remove the role from the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $pull: {
                        'blacklist.roles': role.id,
                    },
                });

                // Send a confirmation message
                message.confirmationReply(`The ${role} role has been removed from the blacklist!`);
            } else {
                // If the users highest role is lower than the specified role return an error
                if (message.member.roles.highest.position <= role.position) return message.errorReply('That role is higher than or equal to your highest role!');

                // Add the role to the blacklist
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $push: {
                        'blacklist.roles': role.id,
                    },
                });

                // Send a confirmation message
                message.confirmationReply(`The ${role} role has been added to the blacklist!`);
            }
        } else {
            // Send an error
            message.errorReply("You didn't specify a valid member, channel or role!");
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'view') {
            // If there are no blacklists return an error
            if (!interaction.settings.blacklist.users.length && !interaction.settings.blacklist.roles.length && !interaction.settings.blacklist.channels.length) return interaction.error("There aren't any blacklists in this guild!");

            // Define the blacklist msg
            let msg = '__**Blacklists**__\n\n';

            if (interaction.settings.blacklist.users.length) {
                // Define the array
                const arr = [];

                // Loop through the users
                for (const user of interaction.settings.blacklist.users) {
                    // Try to get the user
                    const find = await getMember(interaction, user) || await getUser(bot, interaction, user);

                    if (!find) {
                        // If the user does not exist remove them from the db
                        await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                            $pull: {
                                'blacklist.users': user,
                            },
                        });

                        // Push <deleted user> to the array
                        arr.push('<deleted user>');
                    } else {
                        // Push the users tag to the array
                        arr.push(find.user?.tag ?? find.tag);
                    }
                }

                // Add the users to the message
                msg += `${bot.config.emojis.users} **Users:** \`${arr.join('`, `')}\`\n`;
            }

            if (interaction.settings.blacklist.channels.length) {
                // Define the array
                const arr = [];

                // Loop through the channels
                for (const chan of interaction.settings.blacklist.channels) {
                    // Get the channel
                    const find = interaction.guild.channels.cache.get(chan);

                    if (!find) {
                        // If the channel does not exist remove it from the db
                        await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                            $pull: {
                                'blacklist.channels': chan,
                            },
                        });

                        // Push <deleted channel> to the array
                        arr.push('<deleted channel>');
                    } else {
                        // Push the channel to the array
                        arr.push(find.toString());
                    }
                }

                // Add the channels to the message
                msg += `${bot.config.emojis.chatting} **Channels:** ${arr.join(', ')}\n`;
            }

            if (interaction.settings.blacklist.roles.length) {
                // Define the array
                const arr = [];

                // Loop through the roles
                for (const rol of interaction.settings.blacklist.roles) {
                    // Get the role
                    const find = interaction.guild.roles.cache.get(rol);

                    if (!find) {
                        // If the role does not exist remove it from the db
                        await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                            $pull: {
                                'blacklist.roles': rol,
                            },
                        });

                        // Push <deleted role> to the array
                        arr.push('<deleted role>');
                    } else {
                        // Push the role to the array
                        arr.push(find.toString());
                    }
                }

                // Add the roles to the message
                msg += `${bot.config.emojis.group} **Roles:** ${arr.join(', ')}`;
            }

            // Send the message
            interaction.reply(msg);
        } else if (sub === 'channel') {
            // Get the channel
            const ch = interaction.options.get('channel').channel;

            if (interaction.settings.blacklist.channels.includes(ch.id)) {
                // Remove the channel from the blacklist
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    $pull: {
                        'blacklist.channels': ch.id,
                    },
                });

                // Send a confirmation message
                interaction.confirmation(`The ${ch} channel has been removed from the blacklist!`);
            } else {
                // If the channel isn't a text or news channel return an error
                if (ch.type !== 'text' && ch.type !== 'news') return interaction.error("The channel you specified isn't a text or news channel!");

                // Add the channel to the blacklist
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    $push: {
                        'blacklist.channels': ch.id,
                    },
                });

                // Send a confirmation message
                interaction.confirmation(`The ${ch} channel has been added to the blacklist!`);
            }
        } else if (sub === 'user') {
            // Get the user
            const usr = interaction.options.get('user').member || interaction.options.get('user').user;

            if (interaction.settings.blacklist.users.includes(usr.id)) {
                // Remove the user from the blacklist
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    $pull: {
                        'blacklist.users': usr.id,
                    },
                });

                // Send a confirmation message
                interaction.confirmation(`**${usr.user?.tag ?? usr.tag}** has been removed from the blacklist!`);
            } else {
                // Add the user to the blacklist
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    $push: {
                        'blacklist.users': usr.id,
                    },
                });

                // Send a confirmation message
                interaction.confirmation(`**${usr?.user?.tag ?? usr.tag}** has been added to the blacklist!`);
            }
        } else if (sub === 'role') {
            // Get the role
            const rl = interaction.options.get('role').role;

            if (interaction.settings.blacklist.roles.includes(rl.id)) {
                // If the users highest role is lower than the specified role return an error
                if (interaction.member.roles.highest.position <= rl.position) return interaction.error('That role is higher than or equal to your highest role!');

                // Remove the role from the blacklist
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    $pull: {
                        'blacklist.roles': rl.id,
                    },
                });

                // Send a confirmation message
                interaction.confirmation(`The ${rl} role has been removed from the blacklist!`);
            } else {
                // If the users highest role is lower than the specified role return an error
                if (interaction.member.roles.highest.position <= rl.position) return interaction.error('That role is higher than or equal to your highest role!');

                // Add the role to the blacklist
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    $push: {
                        'blacklist.roles': rl.id,
                    },
                });

                // Send a confirmation message
                interaction.confirmation(`The ${rl} role has been added to the blacklist!`);
            }
        }
    },
};
