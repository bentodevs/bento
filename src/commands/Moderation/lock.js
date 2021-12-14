import { getChannel } from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'lock',
        aliases: [],
        usage: 'lock [channel]',
        examples: ['lock #general'],
        description: 'Prevent users from sending messages in a channel',
        category: 'Moderation',
        info: null,
        options: [],
    },
    perms: {
        permission: 'MANAGE_CHANNELS',
        type: 'discord',
        self: ['MANAGE_ROLES'],
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
            name: 'channel',
            type: 'CHANNEL',
            description: 'Specify a channel.',
            required: false,
            channel_types: [
                'GUILD_TEXT',
                'GUILD_NEWS',
            ],
        }],
    },

    run: async (bot, message, args) => {
        // Grab the channel
        const channel = await getChannel(message, args.join(' '), true);

        // Return an error if the channel wasn't found
        if (!channel) return message.errorReply("You didn't specify a valid channel!");

        // Check if the group has permissions to send messages or not
        if (channel.permissionsFor(message.guild.id).has('SEND_MESSAGES')) {
            // Deny send messages & add reaction perms
            channel.permissionOverwrites.edit(message.guild.id, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
            });

            // Send a confirmation message
            message.confirmationReply(`${channel} has been locked!`);
        } else {
            // Set the send messages & add reaction perms to null
            channel.permissionOverwrites.edit(message.guild.id, {
                SEND_MESSAGES: null,
                ADD_REACTIONS: null,
            });

            // Send a confirmation message
            message.confirmationReply(`${channel} has been unlocked!`);
        }
    },

    run_interaction: async (bot, interaction) => {
        // Grab the channel
        const channel = interaction.options.get('channel')?.channel || interaction.channel;

        // If the channel is not a text channel, then return an error
        if (channel.type !== 'GUILD_TEXT') return interaction.error('You did not specify a text channel!');

        // Check if the group has permissions to send messages or not
        if (channel.permissionsFor(interaction.guild.id).has('SEND_MESSAGES')) {
            // Deny send messages & add reaction perms
            channel.permissionOverwrites.edit(interaction.guild.id, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
            });

            // Send a confirmation message
            interaction.confirmation(`${channel} has been locked!`);
        } else {
            // Set the send messages & add reaction perms to null
            channel.permissionOverwrites.edit(interaction.guild.id, {
                SEND_MESSAGES: null,
                ADD_REACTIONS: null,
            });
            // Send a confirmation message
            interaction.confirmation(`${channel} has been unlocked!`);
        }
    },
};
