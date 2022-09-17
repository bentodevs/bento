import { format } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, GuildMember, GuildTextBasedChannel, PermissionFlagsBits } from 'discord.js';
import punishments from '../../database/models/punishments';
import settings from '../../database/models/settings';
import { getSettings } from '../../database/mongo';
import logger from '../../logger';
import { punishmentLog } from '../../modules/functions/moderation';
import { Command } from '../../modules/interfaces/cmd';
import emojis from '../../modules/structures/emotes';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const { utcToZonedTime } = dateFnsTz;

const command: Command = {
    info: {
        name: 'ban',
        usage: 'ban <user> [reason]',
        examples: ['ban @waitrose', 'ban 420325176379703298 Bad dev'],
        description: 'Bans a user from the server',
        category: 'Moderation',
        selfPerms: [
            PermissionFlagsBits.BanMembers,
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
            name: 'user',
            type: ApplicationCommandOptionType.User,
            description: 'The user you wish to ban.',
            required: true,
        }, {
            name: 'reason',
            type: ApplicationCommandOptionType.String,
            description: 'The reason for the ban.',
            required: false,
        }],
        defaultPermission: false,
        dmPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction<"cached">) => {
        const user = interaction.options.getMember('user') as GuildMember;
        const reason = interaction.options.getString('reason') || 'No reason specified';
        const action = await punishments.countDocuments({ guild: interaction.guild?.id }) + 1 || 1;
        const { guild, member }: { guild: Guild, member: GuildMember } = interaction;
        const guildSettings = await getSettings(guild.id);

        // If the user they want to ban is themselves, then return an error
        if (member?.id === user.id) return InteractionResponseUtils.error(interaction, 'You are unable ban yourself!', true);

        if (user.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: `${emojis.error} Questioning authority are we? Sorry, but this isn't a democracy...`, files: ['https://i.imgur.com/K9hmVdA.png'], ephemeral: true });

        if (!user.bannable) return interaction.reply("I can't ban that member! *They may have a higher role than me!*");

        await user?.send(`:hammer: You have been banned from **${interaction.guild.name}** for \`${reason}\``).catch((err) => logger.error(`Failed to ban ${user.id}:`, err));
        user.ban({ deleteMessageDays: 1, reason: `[Case: ${action} | ${interaction.member.user.tag} on ${format(utcToZonedTime(Date.now(), guildSettings.general.timezone), 'PPp (z)')}] ${reason}]` });
        InteractionResponseUtils.confirmation(interaction, `\`${user.user.tag}\` was banned for **${reason}** *(Case #${action})*`, true);

        // Create the punishment record in the DB
        await punishments.create({
            id: action,
            guild: interaction.guild.id,
            type: 'ban',
            user: user.id,
            moderator: interaction.member.id,
            actionTime: Date.now(),
            reason,
        });

        // Send the punishment to the log channel
        const embed = punishmentLog(bot, interaction, user.user, action, reason, 'BAN');

        if (guildSettings.logs?.punishments.channel && guildSettings.logs.punishments.enabled) {
            guild.channels.fetch(guildSettings.logs?.punishments.channel).then(async (channel) => {
                (channel as GuildTextBasedChannel)?.send({ embeds: [embed] });
            }).catch(async (err) => {
                if (guildSettings.logs?.punishments.channel && err?.httpStatus === 404) {
                    await settings.findOneAndUpdate({
                        _id: guild.id
                    }, {
                        'logs.punishments.channel': null, 'logs.punishments.enabled': false
                    });
                } else if (guildSettings.logs?.punishments.channel) {
                    logger.error(`Failed to send to punishment channel in ${guild.id}:`, err);
                }
            });
        }
    },
};

export default command;
