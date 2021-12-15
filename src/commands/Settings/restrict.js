import settings from '../../database/models/settings.js';
import { getChannel } from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'restrict',
        aliases: [
            'limitedchannels',
            'restrictedchannels',
        ],
        usage: 'restrict <channel> [type]',
        examples: [
            'restrict #commands commands',
            'restrict #media images',
            'restrict #media videos',
            'restrict #commands',
        ],
        description: 'Limit channels to commands, images and or videos only.',
        category: 'Settings',
        info: "This command works as a toggle, run it again with the same type and it'll disable it.",
        options: [],
    },
    perms: {
        permission: 'MANAGE_CHANNELS',
        type: 'discord',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'channel',
            type: 'CHANNEL',
            description: 'Specify a text or news channel.',
            required: true,
            channelTypes: [
                'GUILD_TEXT',
                'GUILD_NEWS',
            ],
        }, {
            name: 'type',
            type: 'STRING',
            description: 'Select the restriction type',
            choices: [
                { name: 'commands', value: 'commands' },
                { name: 'images', value: 'images' },
                { name: 'videos', value: 'videos' }],
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        // Define the types
        const types = [
            'commands',
            'images',
            'videos',
        ];

        // Grab the specified channel
        const channel = await getChannel(message, args[0]);

        // If an invalid channel was specified return an error
        if (!channel) return message.errorReply("You didn't specify a valid channel!");
        // If the specified channel isn't a text or new channel return an error
        if (channel.type !== 'GUILD_TEXT' && channel.type !== 'GUILD_NEWS') return message.errorReply("The channel you specified isn't a text or news channel!");

        if (!args[1]) {
            // Try to grab the data for the specified channel
            const data = message.settings.general.restricted_channels.find((a) => a.id === channel.id);

            // If no data was found return an error
            if (!data) return message.errorReply("Looks like there aren't any restrictions on that channel!");

            // Send a message with the current restrictions
            message.confirmationReply(`${channel} is currently restricted to the following types: \`${data.types.join('`, `')}\`!`);
        } else {
            // If the user specified an invalid type return an error
            if (!types.includes(args[1].toLowerCase())) return message.errorReply(`You didn't specify a valid type! Try one of these: \`${types.join('`, `')}\``);

            // Check if the channel already has data
            const data = message.settings.general.restricted_channels.find((a) => a.id === channel.id);

            // Update the settings
            if (data) {
                if (data.types.includes(args[1].toLowerCase())) {
                    if (data.types.length <= 1) {
                        await settings.findOneAndUpdate({ _id: message.guild.id }, {
                            $pull: { 'general.restricted_channels': { id: channel.id } },
                        });

                        message.confirmationReply(`Successfully disabled restrictions for ${channel}!`);
                    } else {
                        await settings.findOneAndUpdate({ _id: message.guild.id, 'general.restricted_channels.id': channel.id }, {
                            $pull: { 'general.restricted_channels.$.types': args[1].toLowerCase() },
                        });

                        message.confirmationReply(`Successfully removed \`${args[1].toLowerCase()}\` from the restricted types for ${channel}!`);
                    }
                } else {
                    await settings.findOneAndUpdate({ _id: message.guild.id, 'general.restricted_channels.id': channel.id }, {
                        $push: { 'general.restricted_channels.$.types': args[1].toLowerCase() },
                    });

                    message.confirmationReply(`Successfully added \`${args[1].toLowerCase()}\` to the restricted types for ${channel}!`);
                }
            } else {
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    $push: {
                        'general.restricted_channels': {
                            id: channel.id,
                            types: [args[1].toLowerCase()],
                        },
                    },
                });

                message.confirmationReply(`Successfully made ${channel} a restricted channel! Users can now only send \`${args[1].toLowerCase()}\` in that channel! If you wish to allow more types run this command again with a different type.`);
            }
        }
    },

    run_interaction: async (bot, interaction) => {
        // Grab the specified channel
        const { channel } = interaction.options.get('channel');

        // If an invalid channel was specified return an error
        if (!channel) return interaction.error("You didn't specify a valid channel!");
        // If the specified channel isn't a text or new channel return an error
        if (channel.type !== 'GUILD_TEXT' && channel.type !== 'GUILD_NEWS') return interaction.error("The channel you specified isn't a text or news channel!");

        if (!interaction.options.get('type')?.value) {
            // Try to grab the data for the specified channel
            const data = interaction.settings.general.restricted_channels.find((a) => a.id === channel.id);

            // If no data was found return an error
            if (!data) return interaction.error("Looks like there aren't any restrictions on that channel!");

            // Send a message with the current restrictions
            interaction.confirmation(`${channel} is currently restricted to the following types: \`${data.types.join('`, `')}\`!`);
        } else {
            // Check if the channel already has data
            const data = interaction.settings.general.restricted_channels.find((a) => a.id === channel.id);

            // Update the settings
            if (data) {
                if (data.types.includes(interaction.options.get('type').value)) {
                    if (data.types.length <= 1) {
                        await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                            $pull: { 'general.restricted_channels': { id: channel.id } },
                        });

                        interaction.confirmation(`Successfully disabled restrictions for ${channel}!`);
                    } else {
                        await settings.findOneAndUpdate({ _id: interaction.guild.id, 'general.restricted_channels.id': channel.id }, {
                            $pull: { 'general.restricted_channels.$.types': interaction.options.get('type').value },
                        });

                        interaction.confirmation(`Successfully removed \`${interaction.options.get('type').value}\` from the restricted types for ${channel}!`);
                    }
                } else {
                    await settings.findOneAndUpdate({ _id: interaction.guild.id, 'general.restricted_channels.id': channel.id }, {
                        $push: { 'general.restricted_channels.$.types': interaction.options.get('type').value },
                    });

                    interaction.confirmation(`Successfully added \`${interaction.options.get('type').value}\` to the restricted types for ${channel}!`);
                }
            } else {
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    $push: {
                        'general.restricted_channels': {
                            id: channel.id,
                            types: [interaction.options.get('type').value],
                        },
                    },
                });

                interaction.confirmation(`Successfully made ${channel} a restricted channel! Users can now only send \`${interaction.options.get('type').value}\` in that channel! If you wish to allow more types run this command again with a different type.`);
            }
        }
    },
};
