module.exports = {
    info: {
        name: "purge",
        aliases: ["prune"],
        usage: "purge <amount>",
        examples: [
            "purge 50",
            "purge 500"
        ],
        description: "Delete a specified number of messages in the channel.",
        category: "Moderation",
        info: "You can delete up to 1000 messages at once.",
        options: []
    },
    perms: {
        permission: "MANAGE_MESSAGES",
        type: "discord",
        self: ["MANAGE_MESSAGES"]
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        // Define the deleteCount and the actualCount
        let deleteCount = parseInt(args[0]) + 2,
        actualCount = 0;

        // If no amount of messages were specified return an error
        if (!deleteCount)
            return message.errorReply("You didn't specify a number of messages to purge!");
        // If the user specified a number above 100 return an error
        if (deleteCount - 2 > 1000)
            return message.errorReply("Please specify a number between 1 and 1000!");

        // Send the status message
        const msg = await message.loadingReply(`Deleting \`${deleteCount - 2}\` messages...`);

        // Create the bulkDelete function
        async function bulkDelete() {
            // Fetch the messages
            let fetched = await message.channel.messages.fetch({ limit: 100 });

            if (!fetched.filter(m => m.id !== msg.id).size)
                return msg.edit(`${bot.config.emojis.confirmation} Deleted \`${actualCount}\` messages!`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            // Delete the messages
            await message.channel.bulkDelete(fetched.filter(m => m.id !== msg.id))
                .then(msgs => {
                    // Update the vars
                    deleteCount -= msgs.size;
                    actualCount += msgs.size;
                })
                .catch(err => {
                    // If an error occured set the deletecount to false and update the status message with the error
                    deleteCount = false;
                    msg.edit(`${bot.config.emojis.error} Something went wrong! \`${err}\``);
                });

            // Return if it errored
            if (!deleteCount)
                return;
            // If there's still over 100 messages to delete run this function again
            if (deleteCount > 100)
                return bulkDelete();

            // Fetch the remaining messages
            fetched = await message.channel.messages.fetch({ limit: deleteCount });

            if (!fetched.filter(m => m.id !== msg.id).size)
                return msg.edit(`${bot.config.emojis.confirmation} Deleted \`${actualCount}\` messages!`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            // Delete the remaining messages
            await message.channel.bulkDelete(fetched.filter(m => m.id !== msg.id))
                .then(msgs => {
                    // Update the status message
                    msg.edit(`${bot.config.emojis.confirmation} Deleted \`${actualCount + msgs.size - 1}\` messages!`);
                })
                .catch(err => {
                    // If an error occured update the status message
                    msg.edit(`${bot.config.emojis.error} Something went wrong! \`${err}\``);
                });

            // Delete the status message after 10 seconds
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 10000);
        }

        // If the user wants to delete more than 100 messages run the bulkDelete function
        if (deleteCount > 100)
            return bulkDelete();

        // Fetch the messages
        const fetched = await message.channel.messages.fetch({ limit: deleteCount });

        // Delete the messages
        await message.channel.bulkDelete(fetched.filter(m => m.id !== msg.id))
            .then(msgs => {
                // Update the status message
                msg.edit(`${bot.config.emojis.confirmation} Deleted \`${msgs.size - 1}\` messages!`);
            })
            .catch(err => {
                // If an error occured update the status message
                msg.edit(`${bot.config.emojis.error} Something went wrong! \`${err}\``);
            });

        // Delete the status message after 10 seconds
        setTimeout(() => {
            msg.delete().catch(() => {});
        }, 10000);

    }
};