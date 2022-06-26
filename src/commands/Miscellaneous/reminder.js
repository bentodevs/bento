import { format, formatDuration, intervalToDuration } from 'date-fns';
import { Permissions } from 'discord.js';
import reminders from '../../database/models/reminders.js';
import { parseTime } from '../../modules/functions/misc.js';

export default {
    info: {
        name: 'reminder',
        usage: 'reminder <"create" <time> <reminder> | "list" | "remove" <reminder>>',
        examples: [
            'reminder create 1d go do something',
            'reminder list',
            'reminder remove 1',
        ],
        description: 'Set, view or remove reminders.',
        category: 'Miscellaneous',
        info: 'You can have up to 25 active reminders.',
        selfPerms: [
            Permissions.FLAGS.EMBED_LINKS,
        ],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        opts: [{
            name: 'create',
            type: 'SUB_COMMAND',
            description: 'Create a reminder.',
            options: [{
                name: 'time',
                type: 'STRING',
                description: 'In how long should I remind you? Example: 1d1h',
                required: true,
            }, {
                name: 'reminder',
                type: 'STRING',
                description: 'What should I remind you about?',
                required: true,
            }],
        }, {
            name: 'list',
            type: 'SUB_COMMAND',
            description: 'View your active reminders.',
        }, {
            name: 'remove',
            type: 'SUB_COMMAND',
            description: 'Remove a reminder.',
            options: [{
                name: 'id',
                type: 'INTEGER',
                description: 'The ID of your reminder.',
                required: true,
            }],
        }],
        defaultPermission: false,
    },

    run: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'list') {
            // Get the remind data
            const data = await reminders.findOne({ _id: interaction.user.id });

            // If the user has no reminders send an error
            if (!data?.reminders.length) return interaction.error({ content: "You don't have any active reminders!", ephemeral: true });

            // Define the reminders msg
            let msg = '🔔 **Reminders**\n\n';

            // Loop through the reminders and add them to the msg
            data.reminders.forEach((r) => {
                msg += `**${r.id}.** ${r.reminder} | **In:** ${Date.now() > r.remindTime ? '<pending>' : formatDuration(intervalToDuration({ start: Date.now(), end: r.remindTime }), { delimiter: ', ' })} | **Set:** ${format(r.timeCreated, 'PPp')}\n`;
            });

            // Send the list of reminders
            interaction.reply({ content: msg, ephemeral: true });
        } else if (sub === 'remove') {
            // Get the remind data and the reminder id
            const data = await reminders.findOne({ _id: interaction.user.id });
            const reminder = interaction.options.get('id').value;

            // If the user has no reminders return an error
            if (!data?.reminders?.length) return interaction.error({ content: "You don't have any active reminders!", ephemeral: true });
            // If the user specified an invalid number return an error
            if (!reminder) return interaction.error({ content: "You didn't specify a valid number!", ephemeral: true });
            // If the user specified and invalid reminder id return an error
            if (!data.reminders.find((r) => r.id === reminder)) return interaction.error({ content: "You didn't specify a valid reminder ID!", ephemeral: true });

            if (data.reminders.length <= 1) {
                // If this was the users last reminder delete their reminddata
                await reminders.findOneAndDelete({ _id: interaction.user.id });
            } else {
                // Remove the reminder from the users reminders
                await reminders.findOneAndUpdate({ _id: interaction.user.id }, {
                    $pull: {
                        reminders: {
                            id: reminder,
                        },
                    },
                });
            }

            interaction.confirmation({ content: `Successfully removed the reminder with the ID: \`${reminder}\`!`, ephemeral: true });
        } else if (sub === 'create') {
            // Get the time, reminder, current time and remind data
            const time = parseTime(interaction.options.get('time').value, 'ms');
            const reminder = interaction.options.get('reminder').value;
            const created = Date.now();
            const data = await reminders.findOne({ _id: interaction.user.id });

            // If no time was specified return an error
            if (!time) return interaction.error({ content: "You didn't specify a valid time!", ephemeral: true });
            // If the time is longer than a year return an error
            if (time > 31556952000) return interaction.error({ content: 'The maximum time for a reminder is 1 year!', ephemeral: true });
            // If the time is less than a minute return an error
            if (time < 60000) return interaction.error({ content: 'The minimum time for a reminder is 1 minute.', ephemeral: true });
            // If the user didn't specify a reminder return an error
            if (!reminder) return interaction.error({ content: "You didn't specify anything to remind you about!", ephermal: true });
            // If the user already has 25 reminders set return an error
            if (data && data.reminders?.length >= 25) return interaction.error({ content: 'You cannot set more than 25 reminders!', ephemeral: true });

            // Get the reminder id
            // eslint-disable-next-line no-unsafe-optional-chaining
            const id = (data?.reminders[data?.reminders.length - 1]?.id ?? 0) + 1;

            // Create the reminder object
            const obj = {
                id,
                reminder,
                guild: interaction.guild?.id ?? null,
                timeCreated: created,
                remindTime: created + time,
                pending: false,
            };

            if (!data) {
                // If the user has no remind data create it
                await reminders.create({
                    _id: interaction.user.id,
                    reminders: [
                        obj,
                    ],
                });
            } else if (data) {
                // Push the reminder to the array in the DB
                await reminders.findOneAndUpdate({ _id: interaction.user.id }, {
                    $push: {
                        reminders: obj,
                    },
                });
            }

            // Send a confirmation message
            interaction.reply({ content: `:mailbox_with_mail: I will remind you about that in **${formatDuration(intervalToDuration({ start: created, end: created + time }), { delimiter: ', ' })}**!`, ephemeral: true });
        }
    },
};
