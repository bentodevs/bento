import dateFnsTz from 'date-fns-tz';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import reminders from '../../database/models/reminders.js';
import { parseTime } from '../../modules/functions/misc.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'remindme',
        aliases: [
            'rmd',
            'rmdme',
            'remind',
        ],
        usage: 'remindme <time | "list" | "remove"> <reminder | remind id>',
        examples: [
            'remindme 1d go do something',
            'remindme list',
            'remindme remove 1',
        ],
        description: 'Set, view or remove reminders.',
        category: 'Miscellaneous',
        info: 'You can have up to 25 active reminders.',
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: true,
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
    },

    run: async (bot, message, args) => {
        // Define the option var
        const opt = args[0].toLowerCase();

        if (opt === 'list') {
            // Get the remind data
            const data = await reminders.findOne({ _id: message.author.id });

            // If the user has no reminders send an error
            if (!data?.reminders.length) return message.errorReply("You don't have any active reminders!");

            // Define the reminders msg
            let msg = '🔔 **Reminders**\n\n';

            // Loop through the reminders and add them to the msg
            data.reminders.forEach((r) => {
                msg += `**${r.id}.** ${r.reminder} | **In:** ${Date.now() > r.remindTime ? '<pending>' : formatDuration(intervalToDuration({ start: Date.now(), end: r.remindTime }), { delimiter: ', ' })} | **Set:** ${format(utcToZonedTime(r.timeCreated, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone })}\n`;
            });

            if (message.guild) {
                // If the message was sent in a guild send the user the reminders in their dms
                message.author.send(msg)
                    .then(() => {
                        message.confirmationReply('I have sent you a DM with your reminders!');
                    }).catch(() => {
                        message.errorReply("Something went wrong, you most likely have your DM's disabled!");
                    });
            } else {
                // Send the reminders
                message.reply(msg);
            }
        } else if (opt === 'remove') {
            // Get the remind data and the reminder id
            const data = await reminders.findOne({ _id: message.author.id });
            const reminder = parseInt(args[1], 10);

            // If the user has no reminders return an error
            if (!data?.reminders?.length) return message.errorReply("You don't have any active reminders!");
            // If the user didn't specify an ID return an error
            if (!args[1]) return message.errorReply("You didn't specify a reminder ID!");
            // If the user specified an invalid number return an error
            if (!reminder) return message.errorReply("You didn't specify a valid number!");
            // If the user specified and invalid reminder id return an error
            if (!data.reminders.find((r) => r.id === reminder)) return message.errorReply("You didn't specify a valid reminder ID!");

            if (data.reminders.length <= 1) {
                // If this was the users last reminder delete their reminddata
                await reminders.findOneAndDelete({ _id: message.author.id });
            } else {
                // Remove the reminder from the users reminders
                await reminders.findOneAndUpdate({ _id: message.author.id }, {
                    $pull: {
                        reminders: {
                            id: reminder,
                        },
                    },
                });
            }

            message.confirmationReply(`Successfully removed the reminder with the ID: \`${reminder}\`!`);
        } else {
            // Get the time, reminder, current time and remind data
            const time = parseTime(args[0], 'ms');
            const reminder = args.slice(1).join(' ');
            const created = Date.now();
            const data = await reminders.findOne({ _id: message.author.id });

            // If no time was specified return an error
            if (!time) return message.errorReply("You didn't specify a valid time!");
            // If the time is longer than a year return an error
            if (time > 31556952000) return message.errorReply('The maximum time for a reminder is 1 year!');
            // If the time is less than a minute return an error
            if (time < 60000) return message.errorReply('The minimum time for a reminder is 1 minute.');
            // If the user didn't specify a reminder return an error
            if (!reminder) return message.errorReply("You didn't specify anything to remind you about!");
            // If the user already has 25 reminders set return an error
            if (data && data.reminders?.length >= 25) return message.errorReply('You cannot set more than 25 reminders!');

            // Get the reminder id
            // eslint-disable-next-line no-unsafe-optional-chaining
            const id = (data?.reminders[data?.reminders.length - 1]?.id ?? 0) + 1;

            // Create the reminder object
            const obj = {
                id,
                reminder,
                guild: message.guild?.id ?? null,
                timeCreated: created,
                remindTime: created + time,
            };

            if (!data) {
                // If the user has no remind data create it
                await reminders.create({
                    _id: message.author.id,
                    reminders: [
                        obj,
                    ],
                });
            } else if (data) {
                // Push the reminder to the array in the DB
                await reminders.findOneAndUpdate({ _id: message.author.id }, {
                    $push: {
                        reminders: obj,
                    },
                });
            }

            // Send a confirmation message
            message.confirmationReply(`I will remind you about that in **${formatDuration(intervalToDuration({ start: created, end: created + time }), { delimiter: ', ' })}**!`);
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'list') {
            // Get the remind data
            const data = await reminders.findOne({ _id: interaction.user.id });

            // If the user has no reminders send an error
            if (!data?.reminders.length) return interaction.error("You don't have any active reminders!");

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
            if (!data?.reminders?.length) return interaction.error("You don't have any active reminders!");
            // If the user specified an invalid number return an error
            if (!reminder) return interaction.error("You didn't specify a valid number!");
            // If the user specified and invalid reminder id return an error
            if (!data.reminders.find((r) => r.id === reminder)) return interaction.error("You didn't specify a valid reminder ID!");

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

            interaction.confirmation(`Successfully removed the reminder with the ID: \`${reminder}\`!`);
        } else if (sub === 'create') {
            // Get the time, reminder, current time and remind data
            const time = parseTime(interaction.options.get('time').value, 'ms');
            const reminder = interaction.options.get('reminder').value;
            const created = Date.now();
            const data = await reminders.findOne({ _id: interaction.user.id });

            // If no time was specified return an error
            if (!time) return interaction.error("You didn't specify a valid time!");
            // If the time is longer than a year return an error
            if (time > 31556952000) return interaction.error('The maximum time for a reminder is 1 year!');
            // If the time is less than a minute return an error
            if (time < 60000) return interaction.error('The minimum time for a reminder is 1 minute.');
            // If the user didn't specify a reminder return an error
            if (!reminder) return interaction.error("You didn't specify anything to remind you about!");
            // If the user already has 25 reminders set return an error
            if (data && data.reminders?.length >= 25) return interaction.error('You cannot set more than 25 reminders!');

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
            interaction.confirmation(`I will remind you about that in **${formatDuration(intervalToDuration({ start: created, end: created + time }), { delimiter: ', ' })}**!`);
        }
    },
};
