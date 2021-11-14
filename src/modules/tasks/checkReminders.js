const { format } = require('date-fns');
const { MessageEmbed } = require('discord.js');
const config = require('../../config');
const reminders = require('../../database/models/reminders');

/**
 * Initialize the checkReminders task
 *
 * @param {Object} bot
 */
exports.init = async (bot) => {
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
                    // Check if the reminder is due
                    if (Date.now() >= rmdData.remindTime) {
                        // Build the embed
                        const embed = new MessageEmbed()
                            .setThumbnail('https://i.imgur.com/gOJ0Cuj.png')
                            .setColor(config.general.embedColor)
                            .addField('Reminder', rmdData.reminder)
                            .addField('Set at', format(rmdData.timeCreated, 'PPp'));

                        // Send the embed to the user
                        user.send({ embeds: [embed] })
                            .catch(() => {});

                        // Check if the user has more than 1 reminder
                        if (data.reminders.length <= 1) {
                            // Delete the user from the reminder database
                            await reminders.findOneAndDelete({ _id: user.id });
                        } else {
                            // Remove the reminder from the users reminders
                            await reminders.findOneAndUpdate({ _id: user.id }, {
                                $pull: {
                                    reminders: {
                                        id: rmdData.id,
                                    },
                                },
                            });
                        }
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
};
