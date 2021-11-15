const config = require('../../config');
const settings = require('../../database/models/settings');
const { getRole, getChannel } = require('../../modules/functions/getters');

module.exports = {
    info: {
        name: 'setup',
        aliases: [],
        usage: 'setup <option> [value]',
        examples: ['setup mute muted', 'setup cmdchannel #commands'],
        description: 'Create, configure and manage the mute role & command channels',
        category: 'Settings',
        info: null,
        options: [
            '`muterole` - Create, configure or disable the mute role',
            '`cmdchannel` - Create, configure or disable command channels',
        ],
    },
    perms: {
        permission: 'ADMINISTRATOR',
        type: 'discord',
        self: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        // List of acceptable options (To be used if a provided option doesn't match)
        const options = ['muterole', 'cmdchannel'];

        if (args[0].toLowerCase() === 'muterole') {
            if (!args[1]) {
                if (message.settings.roles.mute) {
                    // If a mute role exists in the DB but not in the guild role cache
                    // then remove it from the DB & send an error. Else, display the role
                    if (!message.guild.roles.cache.has(message.settings.roles.mute)) {
                        // Set the role to null in the DB
                        await settings.findOneAndUpdate({ _id: message.guild.id }, { 'roles.mute': null });
                        // Return error message
                        return message.errorReply(`No role is currently set as the mute role! Set one up using \`${message.settings.general.prefix}setup mute [role]\``);
                    }
                    // Return the mute role
                    return message.confirmationReply(`The mute role is currently set to ${message.guild.roles.cache.get(message.settings.roles.mute)}`);
                }
                // Send loading message
                const msg = await message.loadingReply('Attempting to create the muted role... *This may take some time*');

                // Create the muted role, set color and provide creation reason
                const muteRole = await message.guild.roles.create({
                    name: 'Muted',
                    color: '#000000',
                    reason: `[Triggered by ${message.author.tag}] Automatic creation of muted role`,
                });
                    // Now add the muted role to every single channel in the discord
                message.guild.channels.cache.forEach((c) => {
                    if (c.type === 'GUILD_TEXT') {
                        c.permissionOverwrites.edit(muteRole, {
                            SEND_MESSAGES: false,
                        });
                    }
                });
                // Set the mute role in the DB
                await settings.findOneAndUpdate({ _id: message.guild.id }, { 'roles.mute': muteRole.id });
                // Edit the loading message to reflect that all tasks are complete
                msg.edit(`${config.emojis.confirmation} The mute role (${muteRole}) was successfully created and configured on all text channels`);
            } else {
                if (args[1].toLowerCase() === 'disable') {
                    // If the uper specifies that we should disable the
                    // mute role, then do so. If there is no role set
                    // then return an error
                    if (message.settings.roles.mute) {
                        // Set the mute role to null in the DB
                        await settings.findOneAndUpdate({ _id: message.guild.id }, { 'roles.mute': null });
                        // Return a confirmation message
                        return message.confirmationReply('The mute role has been cleared!');
                    }
                    // Return error message if no role existed to clear
                    return message.errorReply('There was no mute role for me to clear!');
                }
                // Fetch the role from the guild
                const role = await getRole(message, args.slice(1).join(' '));

                if (role) {
                    // If the role is higher than, or equal to, the bot's highest role then send an error
                    if (message.guild.me.roles.highest.position <= role.position) return message.errorReply('That role is higher than, or equal to, my highest role!');
                    // If the role is higher than, or equal to, the user's highest role then send an error
                    if (message.member.roles.highest.position <= role.position) return message.errorReply('That role is higher than, or equal to, your highest role!');
                    // If the role is already in use then send an error
                    if (message.settings.roles.mute === role.id) return message.errorReply('That role is already being used for the mute role!');

                    // Set the role in the DB
                    await settings.findOneAndUpdate({ _id: message.guild.id }, { 'roles.mute': role.id });
                    // Send a confirmation message with the role
                    return message.confirmationReply(`The mute role has been set to ${role}`);
                }
                // If there was no role returned, then throw an error
                return message.errorReply('You did not specify a valid role!');
            }
        } else if (args[0].toLowerCase() === 'cmdchannel') {
            if (!args[1]) {
                if (message.settings.general.command_channel) {
                    if (!message.guild.channels.cache.has(message.settings.general.command_channel)) {
                        await settings.findOneAndUpdate({ _id: message.guild.id }, { 'general.command_channel': null });
                        return message.errorReply(`No channel is currently set as the command channel! Set one up using \`${message.settings.general.prefix}setup cmdchannel <channel>\``);
                    }

                    return message.confirmationReply(`The command channel is currently set to ${message.guild.channels.cache.get(message.settings.general.command_channel)}`);
                }
                return message.errorReply(`No channel is currently set as the command channel! Set one up using \`${message.settings.general.prefix}setup cmdchannel <channel>\``);
            }
            if (args[1].toLowerCase() === 'disable') {
                if (!message.settings.general.command_channel) {
                    return message.errorReply('There is no command channel currently set!');
                }
                await settings.findByIdAndUpdate({ _id: message.guild.id }, { 'general.command_channel': null });
                return message.confirmationReply('Successfully reset the command channel!');
            }

            const channel = await getChannel(message, args.slice(1).join(' '), true);

            if (!channel) return message.errorReply('I could not find a channel with those details!');

            await settings.findByIdAndUpdate({ _id: message.guild.id }, { 'general.command_channel': channel.id });
            return message.confirmationReply(`The command channel is now set to ${channel}`);
        } else {
            message.errorReply(`It looks like you didn't provide a valid option! Valid options are: \`${options.join('`, `')}\``);
        }
    },
};
