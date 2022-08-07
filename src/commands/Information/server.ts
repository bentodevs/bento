import { stripIndents } from 'common-tags';
import { formatDistance, format } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, PermissionFlagsBits, Snowflake,
} from 'discord.js';
import { getSettings } from '../../database/mongo.js';
import { Command } from '../../modules/interfaces/cmd.js';
import { DEFAULT_COLOR } from '../../modules/structures/constants.js';
import emojis from '../../modules/structures/emotes.js';
import { InteractionResponseUtils } from '../../modules/utils/TextUtils.js';

const { utcToZonedTime } = dateFnsTz;

const command: Command = {
    info: {
        name: 'server',
        usage: '',
        examples: [],
        description: 'Displays information about this guild.',
        category: 'Information',
        selfPerms: [PermissionFlagsBits.EmbedLinks],
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
            name: 'info',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Show information about this guild.',
            options: [],
        }, {
            name: 'banner',
            type: ApplicationCommandOptionType.Subcommand,
            description: "Get the server's banner.",
            options: [],
        }, {
            name: 'icon',
            type: ApplicationCommandOptionType.Subcommand,
            description: "Get the server's icon.",
            options: [],
        }],
        defaultPermission: false,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Create a shortcut to the guild data
        const { guild } = interaction;

        const option = interaction.options.getSubcommand();

        if (option === 'info') {
            const settings = await getSettings(guild?.id ?? '');
            // Fetch all the guild members
            await guild?.members.fetch();

            // Get all the member stats
            const members = guild?.memberCount.toLocaleString() ?? 0;
            const bots = guild?.members.cache.filter((m) => m.user.bot).size.toLocaleString() ?? 0;
            const online = await interaction.guild?.members.fetch()
                .then((guildMembers: Collection<Snowflake, GuildMember>) => Array.from(guildMembers.values()).filter((m: GuildMember) => m.presence?.status && m.presence?.status !== 'offline').length.toLocaleString() ?? 0);

            // Get all the other stats
            const channels = guild?.channels.cache.size;
            const emotes = guild?.emojis.cache.size;
            const roles = guild?.roles.cache.size;
            const boostLevel = guild?.premiumTier;
            const boosters = guild?.premiumSubscriptionCount ?? 0;

            // Format the guild creation date
            const created = format(utcToZonedTime(guild?.createdTimestamp ?? 0, settings.general.timezone), 'PPp (z)');
            const timeSince = formatDistance(guild?.createdTimestamp ?? 0, Date.now(), { addSuffix: true });

            // Fetch the guild owner
            const owner = await guild?.fetchOwner();

            // Security options
            const security = {
                NONE: 'None 📂',
                LOW: 'Low 🔒',
                MEDIUM: 'Medium 🔐',
                HIGH: '(╯°□°）╯︵ ┻━┻ [High]',
                VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ [Phone]',
            };

            // Build embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild?.name ?? '', iconURL: interaction.guild?.iconURL() ?? '' })
                .setColor(owner?.displayHexColor ?? DEFAULT_COLOR)
                .setThumbnail(interaction.guild?.iconURL() ?? '')
                .setDescription(stripIndents`🧑‍🤝‍🧑 **${members}** ${members > 1 ? 'members' : 'member'} [${bots} ${(bots > 1) || (bots === 0) ? 'bots' : 'bot'}] | ${emojis.online} **${online}** online
            📆 **Created:** ${created} (${timeSince})
            🔒 **Security:** ${security[interaction.guild?.verificationLevel ?? 'NONE']}
            ${emojis.nitro} **Server Boost Level:** ${boostLevel} (${boosters} ${(boosters > 1) || (boosters === 0) ? 'boosters' : 'booster'})
            👑 **Owner:** ${owner?.user.tag}

            **Other**
            ${channels} channels | ${emotes} emotes | ${roles} roles`);

            // Send embed
            interaction.reply({ embeds: [embed] });
        } else if (option === 'banner') {
            const banner = guild?.bannerURL();

            if (!banner) return InteractionResponseUtils.error(interaction, 'There is no banner set for this server!', true);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${guild?.name} Banner`, iconURL: guild?.iconURL() ?? '' })
                .setColor((interaction.member as GuildMember)?.displayColor ?? DEFAULT_COLOR)
                .setImage(banner);

            interaction.reply({ embeds: [embed] });
        } else if (option === 'icon') {
            const icon = guild?.iconURL();

            if (!icon) return InteractionResponseUtils.error(interaction, 'There is no icon set for this server!', true);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${guild?.name} Icon`, iconURL: icon })
                .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
                .setImage(icon);

            interaction.reply({ embeds: [embed] });
        }
    },
};

export default command;