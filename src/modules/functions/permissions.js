const config = require('../../config');
const { getRole } = require('./getters');

/**
 * Check if the user has permissions to run the command
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 * @param {Object} message The message (or interaction) object from which to get certain data (Such as guild ID, etc.)
 * @param {Object} permissions The permission data
 * @param {Object} cmd The command data
 *
 * @returns {Promise.<Boolean>} true if the user doesn't have permissions, false if the user does have permissions
 */
exports.checkPerms = async (bot, message, permissions, cmd) => {
    // If the user is a bot owner return false
    if (bot.config.general.devs.includes(message.author?.id ?? message.user.id)) return false;

    // Get the permissions
    const checkCat = message.permissions.categories[cmd.info.category.toLowerCase()]?.permission && JSON.stringify(message.permissions.commands[cmd.info.name]) === JSON.stringify(this.filterSelfPerms(cmd.perms));
    const permission = checkCat ? message.permissions.categories[cmd.info.category.toLowerCase()] : message.permissions.commands[cmd.info.name];

    // Get the location for if data needs to be modified
    const location = !checkCat ? `permissions.commands.${cmd.info.name}` : `permissions.categories.${cmd.info.category.toLowerCase()}`;

    if (message.guild) {
        if (permission.type === 'role' && permission.hierarchic) {
            // Get the role position
            const position = await message.guild.roles.fetch(permission.permission).then((r) => r.position).catch(() => {});

            if (!position) {
                // Update the permission in the database
                await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                    [location]: !checkCat ? this.filterSelfPerms(cmd.perms) : {},
                });

                // Return true
                return true;
            }

            // If the role is higher than the user return true
            if (position > message.member.roles.highest.position) return true;
        } else if (permission.type === 'role' && !permission.hierarchic) {
            // Define the found var
            let found = false;

            for (const i of permission.permission) {
                // Get the role
                const role = await getRole(message, i);

                // If the role wasn't found remove it from the database
                if (!role) {
                    if (permission.permission.length === 1) {
                        await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                            [location]: !checkCat ? this.filterSelfPerms(cmd.perms) : {},
                        });
                    } else {
                        await permissions.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: {
                                [`${location}.permission`]: i,
                            },
                        });
                    }
                } else if (message.member.roles.cache.get(role.id)) {
                    found = true;
                }

                // If no role was found return true
                if (!found) return true;
            }
        } else if (permission.type === 'discord') {
            // If the user is lacking the permission return true
            if (!message.member.permissions.has(permission.permission)) return true;
        } else {
            // If all the checks passed return false
            return false;
        }
    } else {
        // If the cmd is guildOnly return true
        if (cmd.opts.guildOnly) return true;

        // Return false
        return false;
    }
};

/**
 * Check if the bot has permissions to run the command
 *
 * @param {Object} message The message (or interaction) object from which to get certain data (Such as guild ID, etc.)
 * @param {Object} cmd The command information
 *
 * @returns {Promise.<Boolean>}
 */
exports.checkSelf = async (message, cmd) => {
    // If the command was run in dms return false
    if (!message.guild) return false;

    // If the bot doesn't have send messages permissions send the user a dm and return true
    if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) {
        // If DM messages are on send a message
        if (message.settings.general.permission_dms) {
            await (message.author ?? message.user).send(`${config.emojis.error} I don't have permissions to send messages in the channel you ran your command in!`).catch(() => {});
        }

        return true;
    }

    // If the command has self permissions set check if the bot has those permissions
    if (cmd.perms.self.length) {
        // Loop through the self permissions
        for (const data of cmd.perms.self) {
            // If the bot doesn't have one of the permissions return an error and true
            if (!message.channel.permissionsFor(message.guild.me).has(data)) {
                if (message.errorReply) {
                    await message.errorReply(`I am lacking the permission \`${data}\`!`)
                        .catch(() => {});
                } else {
                    await message.error(`I am lacking the permission \`${data}\`!`)
                        .catch(() => {});
                }

                return true;
            }
        }
    }

    // Return false if all the checks passed
    return false;
};

/**
 * Filter the Self Perms from the command object without completely deleting it from the commands collection
 *
 * @param {Object} obj
 *
 * @returns {Object} Filtered Object
 */
exports.filterSelfPerms = (obj) => Object.fromEntries(Object.entries(obj)
    .filter(([key]) => key !== 'self'));
