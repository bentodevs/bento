import {
    ButtonInteraction, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import { Command } from '../interfaces/cmd';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';
import logger from '../../logger';

/**
 * Filter the Self Perms from the command object without completely deleting it from the commands collection
 *
 * @param {Object} obj
 *
 * @returns {Object} Filtered Object
 */
export const filterSelfPerms = (obj: object): object => {
    const perms = Object.fromEntries(Object.entries(obj).filter(([key]) => key !== 'self'));
    return perms;
};

/**
 * Check if the bot has permissions to run the command
 *
 * @param {Object} message The message (or interaction) object from which to get certain data (Such as guild ID, etc.)
 * @param {Object} cmd The command information
 *
 * @returns {Promise.<Boolean>}
 */
export const checkSelf = async (interaction: ButtonInteraction | ChatInputCommandInteraction, cmd: Command): Promise<boolean> => {
    // If the command was run in dms return false
    if (!interaction.inGuild()) return false;

    // If the bot doesn't have send messages permissions send the user a dm and return true
    if (!interaction.channel?.permissionsFor((interaction.guild?.members.me as GuildMember))?.has(PermissionFlagsBits.SendMessages)) {
        // If DM messages are on send a message
        await InteractionResponseUtils.error(interaction, "I don't have permissions to send public messages to this channel!", true);

        return true;
    }

    // If the command has self permissions set check if the bot has those permissions
    if (cmd.info.selfPerms) {
        // Loop through the self permissions
        for (const data of cmd.info.selfPerms) {
            // If the bot doesn't have one of the permissions return an error and true
            if (!interaction.channel.permissionsFor((interaction.guild?.members.me as GuildMember)).has(data)) {
                await InteractionResponseUtils.error(interaction, `I am lacking the permission \`${data}\`!`, true)
                    .catch((err) => { logger.error('Failed to send no-perms message:', err);  });

                return true;
            }
        }
    }

    // Return false if all the checks passed
    return false;
};
