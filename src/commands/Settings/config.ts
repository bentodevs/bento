
import settings from '../../database/models/settings';
import timezones from '../../data/functionalData/timezones';
import { Command } from '../../modules/interfaces/cmd';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { DEFAULT_COLOR } from '../../data/constants';
import { getSettings } from '../../database/mongo';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';
import { formatDuration, intervalToDuration } from 'date-fns';
import { parseTime } from '../../modules/functions/misc';
import emojis from '../../data/emotes';

const command: Command = {
    info: {
        name: 'config',
        usage: 'config [option] <value>',
        examples: [
            'config perm-msg',
            'config perm-dm',
            'config disabled-msgs',
            'config timezone Europe/Amsterdam',
        ],
        description: 'Modify server settings.',
        category: 'Settings',
        information: '[Click here for a list of timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks
        ],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        dmPermission: false,
        defaultPermission: false,
        opts: [{
            name: 'view',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View the current server settings.',
        }, {
            name: 'perm-dms',
            type: ApplicationCommandOptionType.Subcommand,
            description: "Choose whether Bento will DM a User if it doesn't have permissions in a channel.",
        }, {
            name: 'disabled-msgs',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Choose whether Bento will send a message when a command or category is disabled.',
        }, {
            name: 'timezone',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Set the timezone the bot will use in this Server.',
            options: [{
                name: 'timezone',
                type: ApplicationCommandOptionType.String,
                description: 'The timezone you want the bot to use in this Server.',
                required: true,
                autocomplete: true
            }],
        }, {
            name: 'minimum-age',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Set the minimum age an account has to be to join the Server.',
            options: [{
                name: 'age',
                type: ApplicationCommandOptionType.String,
                description: 'The minimum age an account has to be to join the Server (Use disable to unset).',
                required: true,
            }],
        }],
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        // Get the guild settings
        const guildSettings = await getSettings(interaction.guild?.id ?? '');

        if (sub === 'view') {
            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Configuration for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
                .setColor(DEFAULT_COLOR)
                .setFooter({ text: `Guild ID: ${interaction.guild?.id}` })
                .setDescription(`🕑 **Minimum Account Age:** ${guildSettings.moderation.minimumAge?.length ? formatDuration(intervalToDuration({ start: 0, end: parseFloat(guildSettings.moderation.minimumAge) })) : 'Not set'}

            📬 **Send permission DM's:** ${guildSettings.general.sendPermissionDMs ? `${emojis.confirmation} Yes` : `${emojis.error} No`}
            🗨️ **Disabled Messages:** ${guildSettings.general.sendCmdCatDisabledMsgs ? `${emojis.confirmation} Yes` : `${emojis.error} No`}

            🌍 **Timezone:** \`${timezones.find((a) => a.tzCode === guildSettings.general.timezone)?.label ?? 'Europe/London (GMT+00:00)'}\``);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (sub === 'perm-dms') {
            // Get the DB query
            const toUpdate = { 'general.sendPermissionDMs': !guildSettings.general.sendPermissionDMs };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild?.id }, toUpdate);

            // Send a confirmation message
            InteractionResponseUtils.confirmation(interaction, `Users will ${guildSettings.general.sendPermissionDMs ? 'no longer be' : 'now be'} messaged if I don't have permission to execute a command!`, true);
        } else if (sub === 'disabled-msgs') {
            // Get the DB query
            const toUpdate = { 'general.sendCmdCatDisabledMsgs': !guildSettings.general.sendCmdCatDisabledMsgs };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild?.id }, toUpdate);

            // Send a confirmation message
            InteractionResponseUtils.confirmation(interaction, `The disabled messages have been **${guildSettings.general.sendCmdCatDisabledMsgs ? 'disabled' : 'enabled'}**!`, true);
        } else if (sub === 'timezone') {
            // Set the timezone back to default
            if (interaction.options.getString('timezone', true).toLowerCase() === 'default') {
                // If the timezone is already set to default return an error
                if (guildSettings.general.timezone === 'UTC') return InteractionResponseUtils.error(interaction, 'The timezone of this guild is already set to the default!', true);

                // Set the timezone to default
                await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                    'general.timezone': 'UTC',
                });

                // Return a confirmation
                return InteractionResponseUtils.confirmation(interaction, 'Successfully set the timezone of this guild back to default (`UTC`)!', true);
            }

            // Try to find the specified timezone
            const timezone = timezones.find((a) => a.tzCode.toLowerCase() === interaction.options.getString('timezone', true).toLowerCase());

            // If the specified timezone is already set return an error
            if (timezone?.tzCode === guildSettings.general.timezone) return InteractionResponseUtils.error(interaction, `The timezone of this guild is already set to \`${timezone?.label}\`!`, true);

            // Update the setting
            await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                'general.timezone': timezone?.tzCode,
            });

            // Send a confirmation
            InteractionResponseUtils.confirmation(interaction, `Successfully set the timezone of this guild to \`${timezone?.label}\`!`, true);
        } else if (sub === 'minimum-age') {
            // Get the option
            const option = interaction.options.getString('age');
            if (!option) {
                // If no minimum age is set return an error
                if (!guildSettings.moderation.minimumAge) return InteractionResponseUtils.error(interaction, 'There is no minimum account age currently set.', true);

                // Send the current minimum age
                InteractionResponseUtils.confirmation(interaction, `The minimum account age to join this guild is **${formatDuration(intervalToDuration({ start: 0, end: parseFloat(guildSettings.moderation.minimumAge) }))}**!`, true);
            } else if (option.toLowerCase() === 'disable') {
                // If the minimum age is already disabled return an error
                if (!guildSettings.moderation.minimumAge) return InteractionResponseUtils.error(interaction, 'There is no minimum account age currently set.', true);

                // Disable the minimum age
                await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                    'moderation.minimumAge': null,
                });

                // Send a confirmation message
                InteractionResponseUtils.confirmation(interaction, 'The minimum account age has been cleared.', true);
            } else {
                // Get the time
                const time = parseTime(option, 'ms', null);

                // If an invalid time was specified return an error
                if (!time) return InteractionResponseUtils.error(interaction, "You did not specify a valid minimum account age. Please use the format `1d 2h 3m 4s`.", true);
                // If the specified time is the same as the current minimum age return an error
                if (guildSettings.moderation.minimumAge === time.toString()) return InteractionResponseUtils.error(interaction, 'The age specified is already set as the minimum account age.', true);

                // Update the database
                await settings.findOneAndUpdate({ _id: interaction.guild?.id }, {
                    'moderation.minimumAge': time,
                });

                // Send a confirmation message
                InteractionResponseUtils.confirmation(interaction, `Successfully set the minimum required account age of new users to **${formatDuration(intervalToDuration({ start: 0, end: time }))}**!`, true);
            }
        }
    },
};

export default command;
