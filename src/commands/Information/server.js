import { stripIndents } from 'common-tags';
import { formatDistance, format } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { MessageEmbed } from 'discord.js';
import config from '../../config.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'server',
        usage: '',
        examples: [],
        description: 'Displays information about this guild.',
        category: 'Information',
        info: null,
        options: [],
        selfPerms: ['EMBED_LINKS'],
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
            interaction: false,
        },
        opts: [{
            name: 'info',
            type: 'SUB_COMMAND',
            description: 'Show information about this guild.',
            options: [],
        }, {
            name: 'banner',
            type: 'SUB_COMMAND',
            description: "Get the server's banner.",
            options: [],
        }, {
            name: 'icon',
            type: 'SUB_COMMAND',
            description: "Get the server's icon.",
            options: [],
        }],
        defaultPermission: false,
    },

    run: async (bot, interaction) => {
        // Create a shortcut to the guild data
        const { guild } = interaction;

        const option = interaction.options.getSubcommand();

        if (option === 'info') {
            // Fetch all the guild members
            await guild.members.fetch();

            // Get all the member stats
            const members = guild.memberCount.toLocaleString();
            const bots = guild.members.cache.filter((m) => m.user.bot).size.toLocaleString();
            const online = guild.members.cache.filter((m) => m.presence?.status && m.presence?.status !== 'offline').size.toLocaleString();

            // Get all the other stats
            const channels = guild.channels.cache.size;
            const emotes = guild.emojis.cache.size;
            const roles = guild.roles.cache.size;
            const boostLevel = guild.premiumTier;
            const boosters = guild.premiumSubscriptionCount;

            // Format the guild creation date
            const created = format(utcToZonedTime(guild.createdTimestamp, interaction.settings.general.timezone), 'PPp (z)');
            const timeSince = formatDistance(guild.createdTimestamp, Date.now(), { addSuffix: true });

            // Fetch the guild owner
            const owner = await guild.fetchOwner();

            // Security options
            const security = {
                NONE: 'None 📂',
                LOW: 'Low 🔒',
                MEDIUM: 'Medium 🔐',
                HIGH: '(╯°□°）╯︵ ┻━┻ [High]',
                VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ [Phone]',
            };

            // Build embed
            const embed = new MessageEmbed()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true }) })
                .setColor(owner.displayColor ?? bot.config.general.embedColor)
                .setThumbnail(interaction.guild.iconURL({ format: 'png', dynamic: true }))
                .setDescription(stripIndents`🧑‍🤝‍🧑 **${members}** ${members > 1 ? 'members' : 'member'} [${bots} ${(bots > 1) || (bots === 0) ? 'bots' : 'bot'}] | ${config.emojis.online} **${online}** online
            📆 **Created:** ${created} (${timeSince})
            🔒 **Security:** ${security[interaction.guild.verificationLevel]}
            ${config.emojis.nitro} **Server Boost Level:** ${boostLevel} (${boosters} ${(boosters > 1) || (boosters === 0) ? 'boosters' : 'booster'})
            ${config.emojis.ceo} **Owner:** ${owner.user.tag}

            **Other**
            ${channels} channels | ${emotes} emotes | ${roles} roles`);

            // Send embed
            interaction.reply({ embeds: [embed] });
        } else if (option === 'banner') {
            const banner = guild.bannerURL({ format: 'png', dynamic: true });

            if (!banner) return interaction.error({ content: 'There is no banner set for this server!', ephemeral: true });

            const embed = new MessageEmbed()
                .setAuthor({ name: `${guild.name} Banner`, iconURL: guild.iconURL({ format: 'png', animated: true }) })
                .setColor(interaction.member.displayColor ?? bot.config.general.embedColor)
                .setImage(banner);

            interaction.reply({ embeds: [embed] });
        } else if (option === 'icon') {
            const icon = guild.iconURL({ format: 'png', dynamic: true });

            if (!icon) return interaction.error({ content: 'There is no icon set for this server!', ephemeral: true });

            const embed = new MessageEmbed()
                .setAuthor({ name: `${guild.name} Icon`, iconURL: guild.iconURL({ format: 'png', animated: true }) })
                .setColor(interaction.member.displayColor ?? bot.config.general.embedColor)
                .setImage(icon);

            interaction.reply({ embeds: [embed] });
        }
    },
};
