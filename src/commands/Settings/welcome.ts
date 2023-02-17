import { randomUUID } from 'crypto';
import { ActionRowBuilder, ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js';
import { DEFAULT_COLOR } from '../../data/constants';
import settings from '../../database/models/settings';
import { Command } from '../../modules/interfaces/cmd';

const command: Command = {
    info: {
        name: 'welcome',
        usage: 'welcome <option> [value]',
        examples: [
            'welcome channel #welcome',
            'welcome join-msg Welcome, {member}! Make sure you read our #rules',
            'welcome leave-msg Cya later {member} :wave:',
            'welcome dm Hey there, {member}! Welcome to our server :)',
            'welcome join-msg off',
        ],
        description: 'Configure the messages that are sent when Users join/leave the server',
        category: 'Settings',
        information: `Adding \`off\` after any option will clear it's data

        **__Values usable in the join, leave & DM messages__**
        \`{id}\` - The member's ID
        \`{tag}\` - The member's Tag (E.g. Waitrose#0001)
        \`{member}\` - Mentions the member who has just joined
        \`{server}\` - The Server's name
        \`{formattedCount}\` - The member's guild member number, but formatted to be "1st", "2nd", etc. (E.g. The number in which they joined at)
        \`{count}\` - The member's guild member number with no formatting (E.g. The number in which they joined at)`,
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
        options: [{
            name: 'info',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View the current welcome settings for this server.',
            options: [],
        }, {
            name: 'join_dm',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Configure the welcome DM message for this server.',
            options: []
        }, {
            name: 'leave_message',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Configure the leave message for this server.',
            options: []
        }, {
            name: 'leave_channel',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Configure the leave channel for this server.',
            options: [{
                name: 'channel',
                type: ApplicationCommandOptionType.Channel,
                description: 'The channel you want to set as the leave channel.',
                required: false,
                channel_types: [
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement,
                ]
            }]
        }, {
            name: 'join_channel',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Configure the join channel for this server.',
            options: [{
                name: 'channel',
                type: ApplicationCommandOptionType.Channel,
                description: 'The channel you want to set as the join channel.',
                required: false,
                channel_types: [
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement,
                ]
            }]
        }, {
            name: 'join_message',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Configure the join message for this server.',
            options: []
        }],
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'info') {
            const guildSettings = await settings.findOne({ guildId: interaction.guildId });

            const settingsEmbed = new EmbedBuilder()
                .setTitle('Welcome Settings')
                .setColor(DEFAULT_COLOR)
                .addFields([
                    {
                        name: 'Join Message',
                        value: guildSettings?.welcome.joinMessage || 'Not set',
                        inline: true,
                    },
                    {
                        name: 'Join Channel',
                        value: guildSettings?.welcome.channel ? `<#${guildSettings.welcome.channel}>` : 'Not set',
                        inline: true,
                    },
                    {
                        name: 'Leave Message',
                        value: guildSettings?.welcome.leaveMessage || 'Not set',
                        inline: true,
                    },
                    {
                        name: 'Join DM',
                        value: guildSettings?.welcome.userMessage || 'Not set',
                        inline: true,
                    },
                ]);

            interaction.reply({ embeds: [settingsEmbed] });
        } else if (subCommand === 'join_message') {

            // Create a random ID for the text input block
            const textBlockId = randomUUID();
            const modalId = randomUUID();

            const modalBlock = new ActionRowBuilder<ModalActionRowComponentBuilder>()
                .addComponents([
                    new TextInputBuilder()
                        .setCustomId(textBlockId)
                        .setLabel('Set the join message')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ]);

            const modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Welcome Message')
                .addComponents(modalBlock);

            await interaction.showModal(modal)
                .catch((err) => {
                    interaction.reply({
                        content: `An error occurred: ${err.message}`,
                        ephemeral: true,
                    });
                });
        }
    },
};

export default command;
