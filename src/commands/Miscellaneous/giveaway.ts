import { stripIndents } from 'common-tags';
import { formatDuration, intervalToDuration } from 'date-fns';
import {
    ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, Message, NewsChannel, PermissionFlagsBits, TextChannel, User,
} from 'discord.js';
import giveaways from '../../database/models/giveaways';
import logger from '../../logger';
import { getUser } from '../../modules/functions/getters';
import { parseTime, drawGiveawayWinners } from '../../modules/functions/misc';
import { Command } from '../../modules/interfaces/cmd';
import { IGiveaways } from '../../modules/interfaces/db';
import { DEFAULT_COLOR } from '../../data/constants';
import emojis from '../../data/emotes';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'giveaway',
        usage: 'giveaway <"list" [page] | "start" <channel> <duration> <winners> <prize> | "stop" <id> | "end" <id> | "reroll" <id>',
        examples: [
            'giveaway list 2',
            'giveaway start',
            'giveaway stop 5',
            'giveaway end 10',
            'giveaway reroll 1',
        ],
        description: 'Start, manage & list giveaways.',
        category: 'Miscellaneous',
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
            name: 'list',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'List all giveaways.',
            options: [{
                name: 'page',
                type: ApplicationCommandOptionType.Number,
                description: 'The page you want to view.',
                required: false,
            }],
        }, {
            name: 'start',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Starts a giveaway.',
            options: [{
                name: 'channel',
                type: ApplicationCommandOptionType.Channel,
                description: 'The channel you want to host the giveaway in.',
                required: true,
                channelType: ['GUILD_TEXT', 'GUILD_NEWS'],
            }, {
                name: 'duration',
                type: ApplicationCommandOptionType.String,
                description: 'The time the giveaway should last. Example: 1d2h',
                required: true,
            }, {
                name: 'winners',
                type: ApplicationCommandOptionType.Number,
                description: 'Amount of winners the giveaway should have.',
                required: true,
                minValue: 1,
                maxValue: 20,
            }, {
                name: 'prize',
                type: ApplicationCommandOptionType.String,
                description: 'The prize you are giving away',
                required: true,
                maxLength: 256,
            }],
        }, {
            name: 'stop',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Stops an active giveaway without picking a winner.',
            options: [{
                name: 'id',
                type: ApplicationCommandOptionType.Number,
                description: 'The ID of the giveaway.',
                required: true,
            }],
        }, {
            name: 'end',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Ends an active givewaway and picks a winner.',
            options: [{
                name: 'id',
                type: ApplicationCommandOptionType.Number,
                description: 'The ID of the giveaway.',
                required: true,
            }],
        }, {
            name: 'reroll',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Re-roll the winner(s) of a giveaway.',
            options: [{
                name: 'id',
                type: ApplicationCommandOptionType.Number,
                description: 'The ID of the giveaway.',
                required: true,
            }],
        }],
        dmPermission: false,
        defaultPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'list') {
            // Get all the giveaways
            const g = await giveaways.find({ 'guild.guildId': interaction.guild?.id });

            // If there are no giveaways return an error
            if (!g.length) return InteractionResponseUtils.error(interaction, 'There are no giveaways to list!', true);

            // Page Vars
            const pages: Array<Array<IGiveaways>> = [];
            let page = 0;

            // Sort the giveaways by ID
            const sorted: Array<IGiveaways> = g.sort((a, b) => a.id - b.id);

            // Loop through the giveaways and split them into pages of 10
            for (let i = 0; i < sorted.length; i += 10) {
                pages.push(sorted.slice(i, i + 10));
            }

            // If the page option is there set it as the page
            // eslint-disable-next-line no-unsafe-optional-chaining
            if (interaction.options?.get('page')?.value) page = (interaction.options.getNumber('page') ?? 1) - 1;
            // If the page doesn't exist return an error
            if (!pages[page]) return InteractionResponseUtils.error(interaction, "You didn't specify a valid page!", true);

            // Format the description
            const description = pages[page].map((a) => `${a.active ? emojis.online : emojis.dnd} | **ID:** ${a.id} | **Duration:** ${formatDuration(intervalToDuration({ start: a.timestamps.start, end: a.timestamps.end }), { delimiter: ', ' })} | **Winners:** ${a.winners} | **Prize:** ${a.prize}`);

            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Giveaways hosted in ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
                .setColor(DEFAULT_COLOR)
                .setDescription(description.join('\n'))
                .setFooter({ text: `${g.length} Total Giveaways | Page ${page + 1} of ${pages.length}` });

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else if (sub === 'start') {
            // Get all the options
            const channel = interaction.options.getChannel('channel', true);
            const time = parseTime(interaction.options.getString('duration', true), 'ms', null);
            const winners = interaction.options.getNumber('winners', true);
            const prize = interaction.options.getString('prize', true);

            // Time Checks
            if ((time ?? 0) < 60000) return InteractionResponseUtils.error(interaction, 'The minumum duration for a giveaway is 1 minute!', true);
            if ((time ?? 0) > 31556952000) return InteractionResponseUtils.error(interaction, 'The maximum duration for a giveaway is 1 year!', true);

            // Winner Checks
            if (winners > 20) return InteractionResponseUtils.error(interaction, 'The maximum winners for a giveaway is 20!', true);
            if (winners <= 0) return InteractionResponseUtils.error(interaction, 'The giveaway should at least have 1 winner!', true);

            // Prize Checks

            // Get the giveaway ID, start time and end time
            const ID = await giveaways.countDocuments({ 'guild.guildId': interaction.guild?.id }) + 1 ?? 1;
            const start = Date.now();
            const end = Date.now() + (time ?? 0);

            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Giveaway: ${prize}`, iconURL: interaction.guild?.iconURL() ?? '' })
                .setDescription(stripIndents`React with 🎉 to enter the giveaway!

                **Drawn:** <t:${Math.trunc(end / 1000)}:R>
                **Hosted By:** ${interaction.user}`)
                .setTimestamp(end)
                .setColor(DEFAULT_COLOR)
                .setFooter({ text: `${winners} winner${winners > 1 ? 's' : ''} | Ends` });

            // Send the embed & add the reaction
            const messageId = await (channel as NewsChannel | TextChannel)?.send({ embeds: [embed] }).then((msg) => { msg.react('🎉'); return msg.id; });

            // Create the db entry
            await giveaways.create({
                id: ID,
                guild: {
                    guildId: interaction.guild?.id,
                    messageId,
                    channelId: channel.id,
                },
                creator: interaction.user.id,
                winners,
                prize,
                entries: [],
                timestamps: {
                    start,
                    ends: end,
                    length: time,
                },
                active: true,
            });

            // Send a confirmation message
            interaction.reply(`🎉 Nice, the giveaway for \`${prize}\` is now starting in ${channel}!`);
        } else if (sub === 'stop') {
            // Get the giveaway ID
            const id = interaction.options.getNumber('id');

            // Get the giveaway
            const g = await giveaways.findOne({ 'guild.guildId': interaction.guild?.id, id, active: true });

            // If the giveaway wasn't found return an error
            if (!g) return InteractionResponseUtils.error(interaction, 'There is no giveaway with that ID or the giveaway is not active!', true);

            // Get the giveaway message
            const msg = await (interaction.guild?.channels.cache.get(g.guild.channelId) as NewsChannel | TextChannel)?.messages.fetch(g.guild.messageId).catch(() => {
                logger.debug(`Failed to get giveaway message in ${interaction.guildId} - Channel ${g.guild.channelId}`);
            });

            // Delete the giveaway message and set the giveaway to inactive
            await msg?.delete().catch(() => logger.debug(`Failed to delete message ${msg.id} in ${g.guild.channelId}`));
            await giveaways.findOneAndUpdate({ 'guild.guildId': interaction.guild?.id, id, active: true }, { active: false });

            // Send a confirmation
            await InteractionResponseUtils.confirmation(interaction, `The giveaway with the ID \`${g.id}\` has been cancelled!`, true);
        } else if (sub === 'end') {
            // Get the giveaway ID
            const id = interaction.options.getNumber('id', true);

            // Get the giveaway
            const g = await giveaways.findOne({ 'guild.guildId': interaction.guild?.id, id, active: true });

            // If the giveaway wasn't found return an error
            if (!g) return InteractionResponseUtils.error(interaction, 'There is no giveaway with that ID or the giveaway is not active!', true);

            // Get the winners and define the array
            const winners = drawGiveawayWinners(g.entries, g.winners);
            const arr: Array<User | string> = [];

            // Loop through the winners
            for (const data of (winners)) {
                // Get the user
                const user = await getUser(bot, interaction, data, false);

                // If the user exists add it to the array otherwise add <deleted user>
                if (user) {
                    arr.push(user);
                } else {
                    arr.push('<deleted user>');
                }
            }

            // Get the channel, message and giveaway creator
            const channel = interaction.guild?.channels.cache.get(g.guild.channelId);
            const msg = await (channel as TextChannel | NewsChannel)?.messages.fetch(g.guild.messageId).catch(() => logger.debug(`Failed to fetch message ${g.guild.messageId}`));
            const creator = interaction.guild?.members.cache.get(g.creator);

            // Build the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Giveaway: ${g.prize}`, iconURL: interaction.guild?.iconURL() ?? '' })
                // eslint-disable-next-line no-nested-ternary
                .setDescription(stripIndents`${arr.length ? arr.length > 1 ? `**Winners:**\n${arr.join('\n')}` : `**Winner:** ${arr.join('\n')}` : 'Could not determine a winner!'}

                **Drawn:** <t:${Math.trunc(Date.now() / 1000)}:R>
                **Hosted By:** ${creator}`)
                .setTimestamp(Date.now())
                .setColor(DEFAULT_COLOR)
                .setFooter({ text: `${g.winners} winner${g.winners > 1 ? 's' : ''} | Ended at` });

            // Update the embed
            (msg as Message)?.edit({ embeds: [embed] });

            // Set the giveaway to inactive in the db
            await giveaways.findOneAndUpdate({ 'guild.guildId': interaction.guild?.id, id, active: true }, {
                active: false,
            });

            // If no winners were selected return an error otherwise announce the winners
            if (!arr.length) {
                (channel as TextChannel | NewsChannel)?.send(`${emojis.error} A winner could not be determined!`);
            } else {
                (channel as TextChannel | NewsChannel)?.send(`🎉 Congratulations to ${arr.join(', ')} on winning the giveaway for \`${g.prize}\`!`);
            }

            // Send a confirmation message
            InteractionResponseUtils.confirmation(interaction, 'Successfully ended that giveaway!', true);
        } else if (sub === 'reroll') {
            // Get the giveaway ID
            const id = interaction.options.getNumber('id', true);

            // Get the giveaway
            const g = await giveaways.findOne({ 'guild.guildId': interaction.guild?.id, id, active: false });

            // If the giveaway wasn't found return an error
            if (!g) return InteractionResponseUtils.error(interaction, 'There is no giveaway with that ID or the giveaway is still active!', true);

            // Get the winners and define the array
            const winners = drawGiveawayWinners(g.entries, g.winners);
            const arr: Array<User | string> = [];

            // Loop through the winners
            for (const data of (winners)) {
                // Get the user
                const user = await getUser(bot, interaction, data, false);

                // If the user exists add it to the array otherwise add <deleted user>
                if (user) {
                    arr.push(user);
                } else {
                    arr.push('<deleted user>');
                }
            }

            // Send the new winners
            await InteractionResponseUtils.confirmation(interaction, `The giveaway in ${interaction.guild?.channels.cache.get(g.guild.channelId) ? interaction.guild?.channels.cache.get(g.guild.channelId) : '<deleted channel>'} was re-rolled. The new winner(s) are ${arr.join(', ')}!`, false);
            (interaction.guild?.channels.cache.get(g.guild.channelId) as TextChannel | NewsChannel)?.send(`🎉 The giveaway was re-rolled - The new winner(s) are ${arr.join(', ')}!`);
        }
    },
};

export default command;
