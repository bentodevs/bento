import { formatDuration, intervalToDuration } from 'date-fns';
import settings from '../../database/models/settings.js';
import { parseTime } from '../../modules/functions/misc.js';

export default {
    info: {
        name: 'minage',
        aliases: [],
        usage: 'minage [time | "disable"]',
        examples: [
            'minage 1d',
            'minage disable',
        ],
        description: 'Sets the minimum required account age to join the guild.',
        category: 'Settings',
        info: null,
        options: [],
    },
    perms: {
        permission: 'ADMINISTRATOR',
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
            name: 'time',
            type: 'STRING',
            description: 'The minimum required account age to join the guild. (use "disable" to disable)',
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        if (!args[0]) {
            // If no minimum age is set return an error
            if (!message.settings.moderation.minimumAge) return message.errorReply('This guild does not have a minimum account age!');

            // Send the current minimum age
            message.confirmationReply(`The minimum account age to join this guild is **${formatDuration(intervalToDuration({ start: 0, end: message.settings.moderation.minimumAge }))}**!`);
        } else if (args[0].toLowerCase() === 'disable') {
            // If the minimum age is already disabled return an error
            if (!message.settings.moderation.minimumAge) return message.errorReply('The minimum account age is already disabled!');

            // Disable the minimum age
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                'moderation.minimumAge': null,
            });

            // Send a confirmation message
            message.confirmationReply('Successfully disabled the minimum account age!');
        } else {
            // Get the time
            const time = parseTime(args[0], 'ms');

            // If an invalid time was specified return an error
            if (!time) return message.errorReply("You didn't specify a valid time!");
            // If the specified time is the same as the current minimum age return an error
            if (message.settings.moderation.minimumAge === time) return message.errorReply('The time you specified is already set as the minimum required account age!');

            // Update the database
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                'moderation.minimumAge': time,
            });

            // Send a confirmation message
            message.confirmationReply(`Successfully set the minimum required account age of new users to **${formatDuration(intervalToDuration({ start: 0, end: time }))}**!`);
        }
    },

    run_interaction: async (bot, interaction) => {
        const option = interaction.options?.get('time')?.value;

        if (!option) {
            // If no minimum age is set return an error
            if (!interaction.settings.moderation.minimumAge) return interaction.error('This guild does not have a minimum account age!');

            // Send the current minimum age
            interaction.confirmation(`The minimum account age to join this guild is **${formatDuration(intervalToDuration({ start: 0, end: interaction.settings.moderation.minimumAge }))}**!`);
        } else if (interaction.options.get('time').value === 'disable') {
            // If the minimum age is already disabled return an error
            if (!interaction.settings.moderation.minimumAge) return interaction.error('The minimum account age is already disabled!');

            // Disable the minimum age
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                'moderation.minimumAge': null,
            });

            // Send a confirmation message
            interaction.confirmation('Successfully disabled the minimum account age!');
        } else {
            // Get the time
            const time = parseTime(interaction.options.get('time').value, 'ms');

            // If an invalid time was specified return an error
            if (!time) return interaction.error("You didn't specify a valid time!");
            // If the specified time is the same as the current minimum age return an error
            if (interaction.settings.moderation.minimumAge === time) return interaction.error('The time you specified is already set as the minimum required account age!');

            // Update the database
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                'moderation.minimumAge': time,
            });

            // Send a confirmation message
            interaction.confirmation(`Successfully set the minimum required account age of new users to **${formatDuration(intervalToDuration({ start: 0, end: time }))}**!`);
        }
    },
};
