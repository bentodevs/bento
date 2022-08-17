import { stripIndents } from 'common-tags';
import { formatDistance } from 'date-fns';
import {
    version, PermissionFlagsBits, CommandInteraction, GuildMember, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, OAuth2Scopes,
} from 'discord.js';
import mongoose from 'mongoose';
import os from 'os';
import { commands } from '../../bot';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR, SUPPORT_SERVER, VERSION } from '../../modules/structures/constants';
import emojis from '../../modules/structures/emotes';

const command: Command = {
    info: {
        name: 'botstats',
        usage: '',
        examples: [],
        description: 'View some statistics and information about the bot.',
        category: 'Information',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
        ],
    },
    opts: {
        guildOnly: false,
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
        opts: [],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, message: CommandInteraction) => {
        // Get and format the bot uptime
        const uptime = formatDistance(0, (bot.uptime ?? 0));

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Bento v${VERSION}`, iconURL: bot.user?.displayAvatarURL() })
            .setColor((message.member as GuildMember)?.displayHexColor || DEFAULT_COLOR)
            .setDescription(stripIndents`Developed By: ${emojis.waitrose} \`Behn#0001\`
            Uptime: **${uptime}**
            Database State: ${mongoose.connection.readyState === 1 ? `${emojis.online} Healthy` : `${emojis.dnd} Unhealthy`}
            Commands: **${commands.size}**

            Memory Usage: **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(os.totalmem() / 1024 / 1024) > 1024 ? `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB` : `${(os.totalmem() / 1024 / 1024).toFixed(2)}`}** | Ping: **${bot.ws.ping}ms**
            **${bot.guilds.cache.size.toLocaleString()}** servers | **${bot.channels.cache.size.toLocaleString()}** channels | **${bot.users.cache.size.toLocaleString()}** users

            **Dependencies**
            ${emojis.djs} Discord.js **v${version}** | ${emojis.nodejs} Node.js **${process.version}**`);

        const comps = new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder()
                    .setURL('https://bento-bot.com')
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Website'),
                new ButtonBuilder()
                    .setURL(SUPPORT_SERVER)
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Support Server'),
                new ButtonBuilder()
                    .setURL(bot.generateInvite({
                        permissions: [
                            // Guild management permissions
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageEmojisAndStickers,
                            PermissionFlagsBits.ManageGuild,
                            PermissionFlagsBits.ManageRoles,
                            PermissionFlagsBits.ViewAuditLog,

                            // Member management permissions
                            PermissionFlagsBits.ManageNicknames,
                            PermissionFlagsBits.KickMembers,
                            PermissionFlagsBits.BanMembers,
                            PermissionFlagsBits.ModerateMembers,

                            // Channel Management Permissions
                            PermissionFlagsBits.ManageThreads,
                            PermissionFlagsBits.ManageWebhooks,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ManageThreads,

                            // Message Permissions
                            PermissionFlagsBits.MentionEveryone,
                            PermissionFlagsBits.UseExternalEmojis,
                            PermissionFlagsBits.AddReactions,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.SendMessagesInThreads,
                        ],
                        scopes: [
                            OAuth2Scopes.Bot,
                            OAuth2Scopes.ApplicationsCommandsUpdate,
                        ],
                    }))
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Invite Link'),
            ],
        });

        // Send the embed
        message.reply({ embeds: [embed], components: [comps], ephemeral: true });
    },
};

export default command;
