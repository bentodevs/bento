import { ButtonInteraction, CacheType } from 'discord.js';
import emojis from '../../data/emotes';
import reminders from '../../database/models/reminders';

export const handleReminder = async (interaction: ButtonInteraction<CacheType>) => {
    const parts = interaction.customId.split('-');

    if (parts[3] === 'completed') {
        await reminders.findOneAndUpdate({ _id: interaction.user.id }, { $pull: { reminders: { id: parseFloat(parts[2]) } } });
        // Update the original message
        interaction.message.edit({ content: `${emojis.confirmation} Reminder has been completed!`, embeds: interaction.message.embeds, components: [] });

        // Send an ephemeral message confirming it
        interaction.reply({ content: `${emojis.confirmation} Your reminder has been marked as completed!`, ephemeral: true });
    } else if (parts[3] === 'snooze') {
        await reminders.findOneAndUpdate({
            _id: interaction.user.id,
            reminders: {
                $elemMatch: {
                    id: parseInt(parts[2], 10),
                },
            },
        }, {
            $set: {
                'reminders.$.pending': false,
                'reminders.$.remindTime': Date.now() + 600000,
            },
        });

        // Send an ephemeral message confirming it
        interaction.reply({ content: `${emojis.confirmation} Your reminder has been snoozed for 10 minutes!`, ephemeral: true });
    }
};
