import settings from '../../database/models/settings.js';
import { getRole } from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'bypass',
        aliases: [],
        usage: 'bypass [role]',
        examples: [
            'bypass staff',
            'bypass staff+',
        ],
        description: 'Configure roles to bypass the command blacklist.',
        category: 'Settings',
        info: 'This command works as a toggle. Run it again with the same role and you will remove it.\nIf you add a `+` to the end of the role it will set it as that role and all roles above it.',
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
            description: 'View the current bypass settings.',
        }, {
            name: 'role',
            type: 'SUB_COMMAND',
            description: 'Add/remove roles to/from the bypass roles.',
            options: [{
                name: 'role',
                type: 'ROLE',
                description: 'The role you want to add/remove to/from the bypass roles.',
                required: true,
            }, {
                name: 'hierarchic',
                type: 'BOOLEAN',
                description: 'Wether or not the role should be hierarchic (makes all roles above it bypass the blacklist as well)',
                required: false,
            }],
        }],
    },

    run: async (bot, message, args) => {
        if (!args[0]) {
            // If no bypass roles are set return an error
            if (!message.settings.blacklist.bypass.hierarchicRoleId && !message.settings.blacklist.bypass.roles.length) return message.errorReply('Nothing other than users with the Discord Permission `ADMINISTRATOR` currently bypass the command blacklist.');

            // Define the role vars
            const hierarchicRole = message.guild.roles.cache.get(message.settings.blacklist.bypass.hierarchicRoleId);
            const roles = [];

            // If the role no longer exists remove it from the db
            if (message.settings.blacklist.bypass.hierarchicRoleId && !hierarchicRole) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    'blacklist.bypass.hierarchicRoleId': null,
                });
            }

            // Define the bypass settings message
            let msg = '**Bypass Settings**\n';

            if (message.settings.blacklist.bypass.roles.length) {
                // Loop through the bypass roles
                for (const data of message.settings.blacklist.bypass.roles) {
                    // Get the role
                    const role = message.guild.roles.cache.get(data);

                    if (!role) {
                        // If the role doesn't exist remove it from the database
                        await settings.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: {
                                'blacklist.bypass.roles': data,
                            },
                        });
                    } else {
                        // Push the role to the array
                        roles.push(role.toString());
                    }
                }
            }

            // Add the hierarchic role to the message if it exists
            if (message.settings.blacklist.bypass.hierarchicRoleId && hierarchicRole) msg += `\n🎖️ Users with the ${hierarchicRole} role and up bypass the command blacklist.`;
            // Add the bypass roles to the message if they exist
            if (roles.length) msg += `\n${bot.config.emojis.group} The following roles bypass the command blacklist: ${roles.join(', ')}`;

            // Send the message
            message.reply(msg);
        } else {
            // Get the role
            const role = await getRole(message, args.join(' ')) || await getRole(message, args.join(' ').replace('+', ''));

            // If no role was found return an error
            if (!role) return message.errorReply("You didn't specify a valid role!");
            // If the role is higher than or equal to the users highest role return an error
            if (message.member.roles.highest.position <= role.position) return message.errorReply('That role is higher than or equal to your highest role!');

            // Check if the role is hierarchic
            const hierarchic = args.join(' ').toLowerCase().includes('+') && (role.name.match(/\+/g) || []).length < (args.join('').match(/\+/g) || []).length;

            // Get the DB query
            // eslint-disable-next-line no-nested-ternary
            const toUpdate = hierarchic
                ? message.settings.blacklist.bypass.hierarchicRoleId === role.id
                    ? { 'blacklist.bypass.hierarchicRoleId': null }
                    : { 'blacklist.bypass.hierarchicRoleId': role.id }
                : message.settings.blacklist.bypass.roles.includes(role.id)
                    ? { $pull: { 'blacklist.bypass.roles': role.id } }
                    : { $push: { 'blacklist.bypass.roles': role.id } };

            // Update the setting in the db
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send the confirmation message
            // eslint-disable-next-line no-unused-expressions
            hierarchic
                ? message.confirmationReply(`The ${role} role and up will ${message.settings.blacklist.bypass.hierarchicRoleId === role.id ? 'no longer' : 'now'} bypass the command blacklist.`)
                : message.confirmationReply(`Successfully ${message.settings.blacklist.bypass.roles.includes(role.id) ? 'removed' : 'added'} the ${role} role ${message.settings.blacklist.bypass.roles.includes(role.id) ? 'from' : 'to'} the bypass roles.`);
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'view') {
            // If no bypass roles are set return an error
            if (!interaction.settings.blacklist.bypass.hierarchicRoleId && !interaction.settings.blacklist.bypass.roles.length) return interaction.error('Nothing other than users with the Discord Permission `ADMINISTRATOR` currently bypass the command blacklist.');

            // Define the role vars
            const hierarchicRole = interaction.guild.roles.cache.get(interaction.settings.blacklist.bypass.hierarchicRoleId);
            const roles = [];

            // If the role no longer exists remove it from the db
            if (interaction.settings.blacklist.bypass.hierarchicRoleId && !hierarchicRole) {
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    'blacklist.bypass.hierarchicRoleId': null,
                });
            }

            // Define the bypass settings message
            let msg = '**Bypass Settings**\n';

            if (interaction.settings.blacklist.bypass.roles.length) {
                // Loop through the bypass roles
                for (const data of interaction.settings.blacklist.bypass.roles) {
                    // Get the role
                    const role = interaction.guild.roles.cache.get(data);

                    if (!role) {
                        // If the role doesn't exist remove it from the database
                        await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                            $pull: {
                                'blacklist.bypass.roles': data,
                            },
                        });
                    } else {
                        // Push the role to the array
                        roles.push(role.toString());
                    }
                }
            }

            // Add the hierarchic role to the message if it exists
            if (interaction.settings.blacklist.bypass.hierarchicRoleId && hierarchicRole) msg += `\n🎖️ Users with the ${hierarchicRole} role and up bypass the command blacklist.`;
            // Add the bypass roles to the message if they exist
            if (roles.length) msg += `\n${bot.config.emojis.group} The following roles bypass the command blacklist: ${roles.join(', ')}`;

            // Send the message
            interaction.reply(msg);
        } else if (sub === 'role') {
            // Get the role
            const rl = interaction.options.get('role').role;

            // If the role is higher than or equal to the users highest role return an error
            if (interaction.member.roles.highest.position <= rl.position) return interaction.error('That role is higher than or equal to your highest role!');

            // Get the DB query
            // eslint-disable-next-line no-nested-ternary
            const toUpdate = interaction.options.get('hierarchic')?.value
                ? interaction.settings.blacklist.bypass.hierarchicRoleId === rl.id
                    ? { 'blacklist.bypass.hierarchicRoleId': null }
                    : { 'blacklist.bypass.hierarchicRoleId': rl.id }
                : interaction.settings.blacklist.bypass.roles.includes(rl.id)
                    ? { $pull: { 'blacklist.bypass.roles': rl.id } }
                    : { $push: { 'blacklist.bypass.roles': rl.id } };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

            // Send the confirmation message
            // eslint-disable-next-line no-unused-expressions
            interaction.options.get('hierarchic')?.value
                ? interaction.confirmation(`The ${rl} role and up will ${interaction.settings.blacklist.bypass.hierarchicRoleId === rl.id ? 'no longer' : 'now'} bypass the command blacklist.`)
                : interaction.confirmation(`Successfully ${interaction.settings.blacklist.bypass.roles.includes(rl.id) ? 'removed' : 'added'} the ${rl} role ${interaction.settings.blacklist.bypass.roles.includes(rl.id) ? 'from' : 'to'} the bypass roles.`);
        }
    },
};
