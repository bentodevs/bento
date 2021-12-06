import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import settings from '../../database/models/settings.js';
import timezones from '../../modules/functions/timezones.js';

export default {
    info: {
        name: 'config',
        aliases: [],
        usage: 'config [option] <value>',
        examples: [
            'config perm-msg',
            'config perm-dm',
            'config disabled-msgs',
            'config timezone Europe/Amsterdam',
        ],
        description: 'Modify server settings.',
        category: 'Settings',
        info: 'You can find a list of Time Zones [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).',
        options: [
            "`perm-msgs` - Toggle perm msgs (when the user doesn't have perms to run a cmd).",
            "`perm-dms` - Toggle perm dm's (when the bot doesn't have perms to send msgs).",
            '`disabled-msgs` - Toggle messages saying commands/categories are disabled.',
            '`timezone <timezone | "default">` - Set the timezone the bot will use in this guild.',
        ],
    },
    perms: {
        permission: 'ADMINISTRATOR',
        type: 'discord',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [{
            name: 'view',
            type: 'SUB_COMMAND',
            description: 'View the current server settings.',
        }, {
            name: 'perm-msgs',
            type: 'SUB_COMMAND',
            description: "Toggle perm msgs (when the user doesn't have perms to run a cmd).",
        }, {
            name: 'perm-dms',
            type: 'SUB_COMMAND',
            description: "Toggle perm dm's (when the bot doesn't have perms to send msgs).",
        }, {
            name: 'disabled-msgs',
            type: 'SUB_COMMAND',
            description: 'Toggle messages saying commands/categories are disabled.',
        }, {
            name: 'timezone',
            type: 'SUB_COMMAND',
            description: 'Set the timezone the bot will use in this guild.',
            options: [{
                name: 'timezone',
                type: 'STRING',
                description: 'The timezone you want the bot to use in this guild.',
                required: true,
            }],
        }],
    },

    run: async (bot, message, args) => {
        // Get the option
        const option = args?.[0]?.toLowerCase();

        if (!option) {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Guild Settings for ${message.guild.name}`, message.guild.iconURL({ format: 'png', dynamic: true }))
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setFooter(`ID: ${message.guild.id}`)
                .setDescription(`**Permission Messages:** \`${message.settings.general.permission_message ? 'enabled' : 'disabled'}\`
                **Permission DM's:** \`${message.settings.general.permission_dms ? 'enabled' : 'disabled'}\`
                **Disabled Messages:** \`${message.settings.general.disabled_message ? 'enabled' : 'disabled'}\`
                **Level Messages:** \`${message.settings.leveling.messages ? 'enabled' : 'disabled'}\`
                **TimeZone:** \`${timezones.find((a) => a.tzCode === message.settings.general.timezone).label}\``);

            // Send the embed
            message.reply({ embeds: [embed] });
        } else if (option === 'perm-msgs') {
            // Get the DB query
            const toUpdate = { 'general.permission_message': !message.settings.general.permission_message };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(`The permission messages have been **${message.settings.general.permission_message ? 'disabled' : 'enabled'}**!`);
        } else if (option === 'perm-dms') {
            // Get the DB query
            const toUpdate = { 'general.permission_dms': !message.settings.general.permission_dms };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(`The permission dm's have been **${message.settings.general.permission_dms ? 'disabled' : 'enabled'}**!`);
        } else if (option === 'disabled-msgs') {
            // Get the DB query
            const toUpdate = { 'general.disabled_message': !message.settings.general.disabled_message };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(`The disabled messages have been **${message.settings.general.disabled_message ? 'disabled' : 'enabled'}**!`);
        } else if (option === 'level-msgs') {
            // Get the DB query
            const toUpdate = { 'leveling.messages': !message.settings.leveling.messages };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(`The level-up messages have been **${message.settings.leveling.messages ? 'disabled' : 'enabled'}**!`);
        } else if (option === 'timezone') {
            // If no timezone was specified return an error
            if (!args[1]) return message.errorReply("You didn't specify a timezone!");

            // Set the timezone back to default
            if (args.slice(1).join(' ').toLowerCase() === 'default') {
                // If the timezone is already set to default return an error
                if (message.settings.general.timezone === 'UTC') return message.errorReply('The timezone of this guild is already set to the default!');

                // Set the timezone to default
                await settings.findOneAndUpdate({ _id: message.guild.id }, {
                    'general.timezone': 'UTC',
                });

                // Return a confirmation
                return message.confirmationReply('Successfully set the timezone of this guild back to default (`UTC`)!');
            }

            // Try to find the specified timezone
            const timezone = timezones.find((a) => a.tzCode.toLowerCase() === args.slice(1).join(' ').toLowerCase());
            // Build the button
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setURL('https://en.wikipedia.org/wiki/List_of_tz_database_time_zones')
                        .setStyle('LINK')
                        .setLabel('Time Zones'),
                );

            // If an invalid timezone was specified return an error
            if (!timezone) return message.errorReply({ content: "You didn't specify a valid timezone! Click the button below to view a list of timezones.", components: [row] });
            // If the specified timezone is already set return an error
            if (timezone.tzCode === message.settings.general.timezone) return message.errorReply(`The timezone of this guild is already set to \`${timezone.label}\`!`);

            // Update the setting
            await settings.findOneAndUpdate({ _id: message.guild.id }, {
                'general.timezone': timezone.tzCode,
            });

            // Send a confirmation
            message.confirmationReply(`Successfully set the timezone of this guild to \`${timezone.label}\`!`);
        } else {
            // Send an error
            message.errorReply("You didn't specify a valid option! Try one of these: `perm-msgs`, `perm-dms`, `disabled-msgs`, `timezone`");
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'view') {
            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`Guild Settings for ${interaction.guild.name}`, interaction.guild.iconURL({ format: 'png', dynamic: true }))
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setFooter(`ID: ${interaction.guild.id}`)
                .setDescription(`**Permission Messages:** \`${interaction.settings.general.permission_message ? 'enabled' : 'disabled'}\`
                **Permission DM's:** \`${interaction.settings.general.permission_dms ? 'enabled' : 'disabled'}\`
                **Disabled Messages:** \`${interaction.settings.general.disabled_message ? 'enabled' : 'disabled'}\`
                **TimeZone:** \`${timezones.find((a) => a.tzCode === interaction.settings.general.timezone).label}\``);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (sub === 'perm-msgs') {
            // Get the DB query
            const toUpdate = { 'general.permission_message': !interaction.settings.general.permission_message };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

            // Send a confirmation message
            interaction.confirmation(`The permission messages have been **${interaction.settings.general.permission_message ? 'disabled' : 'enabled'}**!`);
        } else if (sub === 'perm-dms') {
            // Get the DB query
            const toUpdate = { 'general.permission_dms': !interaction.settings.general.permission_dms };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

            // Send a confirmation message
            interaction.confirmation(`The permission dm's have been **${interaction.settings.general.permission_dms ? 'disabled' : 'enabled'}**!`);
        } else if (sub === 'disabled-msgs') {
            // Get the DB query
            const toUpdate = { 'general.disabled_message': !interaction.settings.general.disabled_message };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

            // Send a confirmation message
            interaction.confirmation(`The disabled messages have been **${interaction.settings.general.disabled_message ? 'disabled' : 'enabled'}**!`);
        } else if (sub === 'timezone') {
            // Set the timezone back to default
            if (interaction.options.get('timezone').value.toLowerCase() === 'default') {
                // If the timezone is already set to default return an error
                if (interaction.settings.general.timezone === 'UTC') return interaction.error('The timezone of this guild is already set to the default!');

                // Set the timezone to default
                await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                    'general.timezone': 'UTC',
                });

                // Return a confirmation
                return interaction.confirmation('Successfully set the timezone of this guild back to default (`UTC`)!');
            }

            // Try to find the specified timezone
            const timezone = timezones.find((a) => a.tzCode.toLowerCase() === interaction.options.get('timezone').value.toLowerCase());
            // Build the button
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setURL('https://en.wikipedia.org/wiki/List_of_tz_database_time_zones')
                        .setStyle('LINK')
                        .setLabel('Time Zones'),
                );

            // If an invalid timezone was specified return an error
            if (!timezone) return interaction.error({ content: "You didn't specify a valid timezone! Click the button below to view a list of timezones.", components: [row] });
            // If the specified timezone is already set return an error
            if (timezone.tzCode === interaction.settings.general.timezone) return interaction.error(`The timezone of this guild is already set to \`${timezone.label}\`!`);

            // Update the setting
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, {
                'general.timezone': timezone.tzCode,
            });

            // Send a confirmation
            interaction.confirmation(`Successfully set the timezone of this guild to \`${timezone.label}\`!`);
        }
    },
};
