import {
    ChannelType, ChatInputCommandInteraction, GuildTextBasedChannel, EmbedBuilder, PermissionFlagsBits, GuildMember, ApplicationCommandOptionType,
} from 'discord.js';
import logger from '../../logger';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';
import emojis from '../../modules/structures/emotes';
import { InteractionResponseUtils } from '../../modules/utils/TextUtils';

const command: Command = {
    info: {
        name: 'poll',
        usage: 'poll [channel] <question | options>',
        examples: [],
        description: 'Create a poll which you can vote on with reactions.',
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
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            description: 'Specify the channel you want to host the poll in.',
            required: true,
            channelType: [ChannelType.GuildNews, ChannelType.GuildText]
        }, {
            name: 'question',
            type: ApplicationCommandOptionType.String,
            description: 'The question you want to ask with the poll.',
            required: true,
        }, {
            name: 'option_1',
            type: ApplicationCommandOptionType.String,
            description: 'The first option of the poll.',
            required: true,
        }, {
            name: 'option_2',
            type: ApplicationCommandOptionType.String,
            description: 'The second option of the poll.',
            required: true,
        }, {
            name: 'option_3',
            type: ApplicationCommandOptionType.String,
            description: 'The third option of the poll.',
            required: false,
        }, {
            name: 'option_4',
            type: ApplicationCommandOptionType.String,
            description: 'The fourth option of the poll.',
            required: false,
        }, {
            name: 'option_5',
            type: ApplicationCommandOptionType.String,
            description: 'The fifth option of the poll.',
            required: false,
        }, {
            name: 'option_6',
            type: ApplicationCommandOptionType.String,
            description: 'The sixth option of the poll.',
            required: false,
        }, {
            name: 'option_7',
            type: ApplicationCommandOptionType.String,
            description: 'The seventh option of the poll.',
            required: false,
        }, {
            name: 'option_8',
            type: ApplicationCommandOptionType.String,
            description: 'The eigth option of the poll.',
            required: false,
        }, {
            name: 'option_9',
            type: ApplicationCommandOptionType.String,
            description: 'The ninth option of the poll.',
            required: false,
        }, {
            name: 'option_10',
            type: ApplicationCommandOptionType.String,
            description: 'The tenth option of the poll.',
            required: false,
        }],
        defaultPermission: false,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the channel
        const channel = interaction.options.getChannel('channel', true) as GuildTextBasedChannel;

        // If the channel isn't a text or news channel return an error
        if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildNews) return InteractionResponseUtils.error(interaction, "The channel you specified isn't a text or news channel!", true);
        // If the user doesn't have MANAGE_MESSAGES permission but specified a different channel return an error
        if (channel.id !== interaction.channel?.id && !(interaction.channel as GuildTextBasedChannel)?.permissionsFor((interaction.member as GuildMember)).has(PermissionFlagsBits.ManageChannels)) return InteractionResponseUtils.error(interaction, 'To send polls to different channels you need the `Manage Channels` permission!', true);
        // If the user can't send messages in the specified channel return an error
        if (!channel.permissionsFor((interaction.member as GuildMember)).has(PermissionFlagsBits.SendMessages)) return InteractionResponseUtils.error(interaction, "You don't have permissions to send messages in that channel!", true);
        if (!channel.permissionsFor((interaction.guild?.members.me as GuildMember)).has(PermissionFlagsBits.ViewChannel) ||
            !channel.permissionsFor((interaction.guild?.members.me as GuildMember)).has(PermissionFlagsBits.EmbedLinks) ||
        !channel.permissionsFor((interaction.guild?.members.me as GuildMember)).has(PermissionFlagsBits.AddReactions)) return InteractionResponseUtils.error(interaction, "I don't have permissions to send messages in that channel!", true);

        console.log(channel.permissionsFor((interaction.guild?.members.me as GuildMember)).has('ViewChannel'));

        const question = interaction.options.getString('question', true);
        const choices = interaction.options.data.filter((a) => a.name.startsWith('option')).map((a) => a.value);

        // If the choices are the same return an error
        if (choices.every((val, i, arr) => (val as string)?.trim() === (arr[0] as string)?.trim())) return InteractionResponseUtils.error(interaction, 'You should at least give them a choice 🤔', true);

        // Define all the emotes
        const emotes = {
            1: '🇦',
            2: '🇧',
            3: '🇨',
            4: '🇩',
            5: '🇪',
            6: '🇫',
            7: '🇬',
            8: '🇭',
            9: '🇮',
            10: '🇯',
        };

        // Define the msg var
        let msg = `${emojis.poll} ${question.trim()}\n\n**React to this message to vote**\n\n`;

        // Loop through the choices and add them to the msg
        choices.forEach((choice, index) => {
            msg += `${emotes[index + 1]} - ${(choice as string)?.trim()}\n`;
        });

        // Build the embed
        const embed = new EmbedBuilder()
            .setThumbnail('https://i.imgur.com/6DbXHMG.png')
            .setDescription(msg)
            .setFooter({ text: `Started by: ${interaction.user.tag}` })
            .setTimestamp()
            .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR);

        // Send the embed
        await channel.send({ embeds: [embed] }).then((msg) => {
            choices.forEach(async (data, index) => {
                await msg.react(emotes[index + 1]);
            });

            // Send a confirmation message
            InteractionResponseUtils.confirmation(interaction, `The poll has successfully been started in ${channel}!`, false);
        }).catch((err) => {
            InteractionResponseUtils.error(interaction, `Oops, something went wrong! Check I have the right permissions in ${channel}, or reach out in our Support Server.`, true);
            logger.error(err);
        });
    },
};

export default command;
