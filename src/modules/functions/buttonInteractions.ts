import { randomUUID } from 'crypto';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ComponentType, MessageComponentInteraction } from 'discord.js';
import emojis from '../../data/emotes';
import reminders from '../../database/models/reminders';
import logger from '../../logger';

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

export const confirmationButton = async (interaction, action: string): Promise<{ exec: boolean, interaction: ButtonInteraction }> => {
    // Set the customId
    const customId = randomUUID();
    let confirm = false;

    // Create the yes/no buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`${customId}-yes`)
                .setLabel('Yes')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`${customId}-no`)
                .setLabel('No')
                .setStyle(ButtonStyle.Danger),
        );

    // Send a message asking if the user is sure
    const msg = await interaction.reply({ content: action, components: [row], fetchReply: true });

    // Create the filter
    const filter = async (i: ButtonInteraction) => {
        await i.deferUpdate();
        return i.user.id === interaction.user.id;
    };

    // Await a button click
    await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 30000 })
        .then(async (i: MessageComponentInteraction) => {
            logger.info(`Button clicked: ${i.customId}`);
            if (i.customId.endsWith('yes')) {
                return confirm = true;
            } else {
                return;
            }
        })
        .catch(async (error: Error) => {
            logger.error(error.stack);
            return;
        });

    return { exec: confirm, interaction };
};
