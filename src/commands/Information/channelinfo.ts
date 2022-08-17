import {
    formatDuration, intervalToDuration,
} from 'date-fns';
import {
    ApplicationCommandOptionType,
    BaseGuildTextChannel, BaseGuildVoiceChannel, CategoryChannel, ChatInputCommandInteraction, EmbedBuilder, GuildBasedChannel, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';

const command: Command = {
    info: {
        name: 'channelinfo',
        usage: 'channelinfo [channel]',
        examples: [
            'channelinfo #general',
            'channelinfo vc-1',
        ],
        description: 'Show information about a channel.',
        category: 'Information',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
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
        opts: [{
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            description: 'Specify a channel.',
            required: true,
        }],
        dmPermission: false,
        defaultPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the channel
        const channel = interaction.options.getChannel('channel', true);

        // Define formatting for all the channel types
        const types = {
            0: {
                type: 'Channel',
                icon: 'https://i.imgur.com/6VyvJWL.png',
            },
            2: {
                type: 'Voice Channel',
                icon: 'https://i.imgur.com/yXE4Yg9.png',
            },
            4: {
                type: 'Category',
                icon: 'https://i.imgur.com/Oyl9rvi.png',
            },
            5: {
                type: 'News Channel',
                icon: 'https://i.imgur.com/6VyvJWL.png',
            },
            13: {
                type: 'Stage Channel',
                icon: 'https://i.imgur.com/yXE4Yg9.png',
            },
        };

        // Define the desc and lastMessage vars
        let desc = '';

        // Build the description
        desc += `**Created:** <t:${Math.trunc(((channel as GuildBasedChannel)?.createdTimestamp ?? 0) / 1000)}> (<t:${Math.trunc(((channel as GuildBasedChannel)?.createdTimestamp ?? 0) / 1000)}:R>)\n`;
        desc += `**Position:** ${(channel as BaseGuildTextChannel | BaseGuildVoiceChannel)?.position}${channel instanceof (BaseGuildTextChannel || BaseGuildVoiceChannel) && channel?.parentId ? ' (in category)' : ''} | [Open Channel](https://discord.com/channels/${interaction.guild?.id}/${channel?.id})\n`;

        if (channel instanceof CategoryChannel && channel?.children) desc += `**Channels:** ${Array.from(channel.children.cache.values()).join(', ')}\n`;
        if (channel instanceof (BaseGuildTextChannel || BaseGuildVoiceChannel) && channel?.parentId) desc += `**Category:** ${interaction.guild?.channels.cache.get(channel?.parentId)?.name}\n`;
        if (channel instanceof BaseGuildVoiceChannel && channel?.bitrate) desc += `**Bitrate:** ${channel.bitrate}kbps\n`;
        if (channel instanceof BaseGuildVoiceChannel && channel?.members) desc += `**Users Connected:** ${channel.members ? channel.members.size : 0}\n`;
        if (channel instanceof BaseGuildTextChannel && channel?.topic) desc += `**Topic:** ${channel.topic !== '' ? channel.topic : 'None'}\n`;
        if (channel instanceof BaseGuildTextChannel && channel?.nsfw) desc += '**NSFW:** True\n';
        if (channel instanceof BaseGuildTextChannel && (channel?.rateLimitPerUser ?? 0) > 0) desc += `\n**Rate Limit:** ${formatDuration(intervalToDuration({ start: 0, end: (channel?.rateLimitPerUser ?? 0) * 1000 }), { delimiter: ', ' })}`;

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${types[(channel as GuildBasedChannel)?.type].type}: ${channel?.name}`, iconURL: types[(channel as GuildBasedChannel)?.type].icon })
            .setDescription(desc)
            .setFooter({ text: `ID: ${channel?.id}` })
            .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
