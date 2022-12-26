import {
    ButtonStyle, Client, ActionRowBuilder, ButtonBuilder, EmbedBuilder,
} from 'discord.js';
import * as Sentry from '@sentry/node';
import reminders from '../../database/models/reminders';
import logger from '../../logger';
import { DEFAULT_COLOR } from '../../data/constants';

/**
 * Initialize the checkReminders task
 *
 * @param {Object} bot
 */
export default async function init(bot: Client): Promise<NodeJS.Timer> {
    /**
     * Fetch all the users in the reminder DB and send them their reminders if they are due
     *
     * @param {Object} bot
    */

    // eslint-disable-next-line no-shadow
    const checkReminders = async () => {
        // Get all users that have active reminders
        const users = await reminders.find({});

        // Loop through the users
        for (const data of users) {
            // Try to fetch the user
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const user = bot.users.cache.get(data.id) || await bot.users.fetch(data.id).catch((err) => {
                Sentry.captureException(err);
                logger.error(`Failed to fetch User: ${data.id}`, err);
            });

            if (user) {
                // Loop through the reminders
                for (const rmdData of data.reminders) {
                    if (rmdData.pending) return;

                    // Check if the reminder is due
                    if (Date.now() >= rmdData.timestamps.remindAt) {
                        // Create the custom ID
                        const customId = `reminder-${data.id}-${rmdData.id}`;
                        // Build the embed
                        const embed = new EmbedBuilder()
                            .setThumbnail('https://twemoji.maxcdn.com/v/latest/72x72/1f4ec.png')
                            .setColor(DEFAULT_COLOR)
                            .addFields([
                                {
                                    name: 'Reminder',
                                    value: rmdData.text,
                                },
                                {
                                    name: 'Set at',
                                    value: `<t:${rmdData.timestamps.created}>`,
                                },
                            ]);

                        const row = new ActionRowBuilder<ButtonBuilder>({
                            components: [
                                new ButtonBuilder()
                                    .setCustomId(`${customId}-completed`)
                                    .setLabel('Completed')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId(`${customId}-snooze`)
                                    .setLabel('Snooze for 10 minutes')
                                    .setStyle(ButtonStyle.Primary),
                            ],
                        });

                        // Send the embed to the user
                        user.send({
                            embeds: [embed],
                            components: [row],
                        }).catch(() => {
                            logger.debug(`Failed to send reminder message to ${user.id}`);
                        });

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
                reminders.findOneAndDelete({ _id: data.id });
            }
        }

        return true;
    };

    // Run the checkReminders function
    await checkReminders();

    // Run the checkReminders function every 30 seconds
    const interval = setInterval(async () => {
        await checkReminders();
    }, 30000);

    // Return the interval info
    return interval;
}
