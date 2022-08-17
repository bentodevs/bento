/* eslint-disable no-multi-assign, no-param-reassign */
import { stripIndents } from 'common-tags';
import {
    Client, Interaction, InteractionType, ChatInputCommandInteraction,
} from 'discord.js';
import Sentry from '@sentry/node';
import { getSettings } from '../database/mongo';
import { checkBlacklist } from '../modules/functions/moderation';
import { checkSelf } from '../modules/functions/permissions';
import { handleReminder } from '../modules/functions/buttonInteractions';
import { commands } from '../bot';
import logger from '../logger';
import { OWNERS, SUPPORT_SERVER } from '../modules/structures/constants';
import emojis from '../modules/structures/emotes';
import { InteractionResponseUtils } from '../utils/InteractionResponseUtils';

export default async (bot: Client, interaction: Interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
        // Return if the user is a bot
        if (interaction.user.bot) return;

        // Get the settings and permissions
        const settings = await getSettings(interaction?.guild?.id ?? '');

        // If the member isn't found try to fetch it
        if (interaction.guild && !interaction.member) await interaction.guild.members.fetch(interaction.user).catch(() => { logger.error(`Failed to fetch ${interaction.user.id}`);  });

        // Get the command
        const cmd = commands.get(interaction.commandName);

        // Check if the user is blacklisted
        if (await checkBlacklist(interaction)) return;

        // If the command doesn't exist return an error
        if (!cmd) return InteractionResponseUtils.error(interaction, "The command you ran wasn't found!", true);
        // If the command is disabled return an error
        if (cmd.opts.disabled && !OWNERS.includes(interaction.user.id)) {
            // If disabled messages are enabled send one
            if (settings?.general?.disabled_message) {
                await InteractionResponseUtils.error(interaction, 'This command is currently disabled!', true);
            }

            // Return
            return;
        }
        // If a guildOnly command is run in dms return an error
        if (cmd.opts.guildOnly && !interaction.guildId) return InteractionResponseUtils.error(interaction, 'This command is unavailable via private messages. Please run this command in a guild.', true);
        // If the command or category is disabled return an error
        if (interaction.inGuild() && (settings.general.disabled_commands?.includes(cmd.info.name) || settings.general.disabled_categories?.includes(cmd.info.category)) && !OWNERS.includes(interaction.user.id)) {
            // If disabled messages are enabled send one
            if (settings.general.disabled_message) {
                await InteractionResponseUtils.error(interaction, 'This command (or the category the command is in) is currently disabled!', true);
            }

            // Return
            return;
        }

        // If the bot doesn't have permissions to run the command return
        if (await checkSelf((interaction as ChatInputCommandInteraction), cmd)) return;

        // Try to run the command
        try {
            // Run the command
            await cmd.run(bot, interaction);
        } catch (err) {
            // Send the error to Sentry
            // Sentry.captureException(err);

            // If the bot is in a dev environment log the error as well
            logger.error(err);

            // Send the error message to the user
            InteractionResponseUtils.error(
                interaction,
                stripIndents(`An error occurred while running the command: \`${err}\`

            ${emojis.url} If this issue persists please report it in our discord: ${SUPPORT_SERVER}`),
                true,
            );
        }

        // Log that the command has been run
        logger.debug(`${interaction.user.tag} (${interaction.user.id}) ran command ${cmd.info.name}${interaction?.guildId ? ` in ${interaction.guild?.name} (${interaction.guildId})` : " in DM's"}`);
    } else if (interaction.isButton()) {
        // Return if the user is a bot
        if (interaction.user.bot) return;

        if (interaction.customId.startsWith('reminder-')) return handleReminder(interaction);
    }
};
