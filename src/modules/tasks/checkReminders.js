import { format } from 'date-fns';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import config from '../../config.js';
import reminders from '../../database/models/reminders.js';

/**
 * Initialize the checkReminders task
 *
 * @param {Object} bot
 */
export default async function init(bot) {
    /**
     * Fetch all the users in the reminder DB and send them their reminders if they are due
     *
     * @param {Object} bot
    */

    // eslint-disable-next-line no-shadow
    const checkReminders = async (bot) => {
        // Get all users that have active reminders
        const users = await reminders.find({});

        // Loop through the users
        for (const data of users) {
            // Try to fetch the user
            const user = bot.users.cache.get(data.id) || await bot.users.fetch(data.id).catch(() => {});

            if (user) {
                // Loop through the reminders
                for (const rmdData of data.reminders) {
                    if (rmdData.pending) return;

                    // Check if the reminder is due
                    if (Date.now() >= rmdData.remindTime) {
                        // Create the custom ID
                        const customId = `reminder-${data.id}-${rmdData.id}`;
                        // Build the embed
                        const embed = new MessageEmbed()
                            .setThumbnail('https://i.imgur.com/gOJ0Cuj.png')
                            .setColor(config.general.embedColor)
                            .addField('Reminder', rmdData.reminder)
                            .addField('Set at', format(rmdData.timeCreated, 'PPp'));

                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId(`${customId}-completed`)
                                    .setLabel('Completed')
                                    .setStyle('SUCCESS'),
                                new MessageButton()
                                    .setCustomId(`${customId}-snooze`)
                                    .setLabel('Snooze for 10 minutes')
                                    .setStyle('PRIMARY'),
                            );

                        // Send the embed to the user
                        user.send({ embeds: [embed], components: [row] })
                            .catch(() => { });

                        // Set the reminder to pending so it can be completed or snoozed
                        await reminders.findOneAndUpdate({
                            _id: data.id,
                            reminders: {
                                $elemMatch: {
                                    id: rmdData.id,
                                },
                            },
                        }, {
                            $set: {
                                'reminders.$.pending': true,
                            },
                        });
                    }
                }
            } else {
                // Delete the users reminder data as the user cannot be found anymore
                reminders.delete(data.user);
            }
        }

        return true;
    };

    // Run the checkReminders function
    await checkReminders(bot);

    // Run the checkReminders function every 30 seconds
    const interval = setInterval(async () => {
        await checkReminders(bot);
    }, 30000);

    // Return the interval info
    return interval;
}
