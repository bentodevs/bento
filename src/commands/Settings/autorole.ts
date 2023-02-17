import { ApplicationCommandOptionType, ChatInputCommandInteraction, Role } from 'discord.js';
import emojis from '../../data/emotes';
import settings from '../../database/models/settings';
import { getSettings } from '../../database/mongo';
import { confirmationButton } from '../../modules/functions/buttonInteractions';
import { Command } from '../../modules/interfaces/cmd';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'autorole',
        usage: 'autorole [role | "disable"]',
        examples: [
            'autorole @Member',
            'autorole disable'
        ],
        description: 'Add, remove or show the auto roles for this guild.',
        category: 'Settings',
        selfPerms: [],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        dmPermission: false,
        defaultPermission: false,
        opts: [{
            name: 'list',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'List all the roles automatically given to a new member.',
        }, {
            name: 'add',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Add a role to be given to a User when they join.',
            options: [{
                name: 'role',
                type: ApplicationCommandOptionType.Role,
                description: 'The role you want to add or remove.',
                required: true,
            }],
        }, {
            name: 'remove',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Remove a role from being given to a User when they join.',
        }, {
            name: 'reset',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Remove all roles automatically given to Users when they join.',
        }],
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const guildSettings = await getSettings(interaction.guildId!);

        if (sub === 'list') {
            // Check if there are any auto roles
            if (guildSettings.roles.length) {
                // Define the roles array
                const roles: Role[] = [];

                // Loop through the roles
                for (const data of guildSettings.roles) {
                    // Try to fetch the role
                    const role = await interaction.guild?.roles.fetch(data);

                    // If the role exists add it to the array, if not remove it from the database
                    if (role) {
                        roles.push(role);
                    } else {
                        await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                            $pull: {
                                roles: data,
                            },
                        });
                    }
                }

                // If no roles were found return an error
                if (!roles.length) return InteractionResponseUtils.error(interaction, "There aren't any auto roles setup.", true);

                // Send a message with the roles
                InteractionResponseUtils.confirmation(interaction, `The following roles have been added: ${roles.join(', ')}`, true);
            } else {
                // Send an error message
                InteractionResponseUtils.error(interaction, "There aren't any auto roles setup.", true);
            }
        } else if (sub === 'add') {
            // Get the role
            const r = interaction.options.getRole('role', true);

            const highestBotRole: number = interaction.guild?.members.me?.roles.highest.position ?? 0;
            const highestUserRole: number = interaction.guild?.members.cache.get(interaction.user.id)?.roles.highest.position ?? 0;
            // If the role is higher than or equal to the bots highest role return an error
            if (highestBotRole <= r.position) return InteractionResponseUtils.error(interaction, 'That role is higher than or equal to my highest role.', true);
            // If the role is higher than or equal to the users highest role return an error
            if (highestUserRole <= r.position) return InteractionResponseUtils.error(interaction, 'That role is higher than or equal to your highest role.', true);
            // Check if the role is already in the database
            if (guildSettings.roles?.includes(r.id)) return InteractionResponseUtils.error(interaction, 'That role will already be given to a User when they join.', true);
            // Add the role to the database
            await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                $push: {
                    roles: r.id,
                },
            });

            // Send a confirmation message
            InteractionResponseUtils.confirmation(interaction, `Successfully added the ${r} role to the auto roles.`, true);
        } else if (sub === 'remove') {
            // Get the role
            const r = interaction.options.getRole('role', true);

            // Check if the role is in the database
            if (!guildSettings.roles.includes(r.id)) return InteractionResponseUtils.error(interaction, 'That role is not in the auto roles.', true);
            // Remove the role from the database
            await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                $pull: {
                    roles: r.id,
                },
            });

            // Send a confirmation message
            InteractionResponseUtils.confirmation(interaction, `Successfully removed the ${r} role from the auto roles.`, true);
        } else if (sub === 'reset') {
            if (guildSettings.roles.length > 0) {
                const confirmation = await confirmationButton(interaction, 'Are you sure you want to remove all auto roles?');

                if (confirmation) {
                    // Remove the roles from the database
                    await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                        roles: [],
                    });

                    // Send a confirmation message
                    interaction.editReply({ content: `${emojis.confirmation} Successfully removed all auto roles.`, components: [] });
                }
            } else {
                InteractionResponseUtils.error(interaction, "There aren't any auto roles setup.", true);
            }
        }
    },
};

export default command;
