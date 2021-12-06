import { stripIndents } from 'common-tags';
import { formatDistance, format } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { MessageEmbed } from 'discord.js';
import config from '../../config.js';
import { getRole } from '../../modules/functions/getters.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'roleinfo',
        aliases: [
            'rinfo',
        ],
        usage: 'roleinfo <role>',
        examples: [
            'roleinfo everyone',
            'roleinfo staff',
        ],
        description: 'Show infomration about a certain role.',
        category: 'Information',
        info: null,
        options: [],
    },
    perms: {
        permission: 'MANAGE_ROLES',
        type: 'discord',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'role',
            type: 'ROLE',
            description: 'Select a role.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // Get the role
        const role = await getRole(message, args.join(' '));

        // If a invalid role was specified return an error
        if (!role) return message.errorReply("You didn't specify a valid role!");

        // Format the role creation timestamp
        const created = format(utcToZonedTime(role.createdTimestamp, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone });
        const timeSince = formatDistance(role.createdTimestamp, Date.now(), { addSuffix: true });

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Role: ${role.name}`, `https://dummyimage.com/64x64/${role.hexColor.replace('#', '')}/${role.hexColor.replace('#', '')}`)
            .setThumbnail(`https://dummyimage.com/256x256/${role.hexColor.replace('#', '')}/${role.hexColor.replace('#', '')}`)
            .setFooter(`ID: ${role.id}`)
            .setColor(role.hexColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`**Position:** ${role.position + 1}/${message.guild.roles.cache.size}
            **Color:** ${!role.color ? 'Default' : role.hexColor}
            **${role.members.size} member(s)** | ${config.emojis.online} **${role.members.filter((m) => m.presence && m.presence.status !== 'offline').size}** online
            **Created:** ${created} (${timeSince})
            **Hoisted:** ${role.hoist.toString().toTitleCase()}
            **Mentionable:** ${role.mentionable.toString().toTitleCase()}`);

        // Send the embed
        message.reply({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Get the role
        const { role } = interaction.options.get('role');

        // Format the role creation timestamp
        const created = format(utcToZonedTime(role.createdTimestamp, interaction.settings.general.timezone), 'PPp (z)', { timeZone: interaction.settings.general.timezone });
        const timeSince = formatDistance(role.createdTimestamp, Date.now(), { addSuffix: true });

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`Role: ${role.name}`, `https://dummyimage.com/64x64/${role.hexColor.replace('#', '')}/${role.hexColor.replace('#', '')}`)
            .setThumbnail(`https://dummyimage.com/256x256/${role.hexColor.replace('#', '')}/${role.hexColor.replace('#', '')}`)
            .setFooter(`ID: ${role.id}`)
            .setColor(role.hexColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`**Position:** ${role.position + 1}/${interaction.guild.roles.cache.size}
            **Color:** ${!role.color ? 'Default' : role.hexColor}
            **${role.members.size} member(s)** | ${config.emojis.online} **${role.members.filter((m) => m.presence && m.presence.status !== 'offline').size}** online
            **Created:** ${created} (${timeSince})
            **Hoisted:** ${role.hoist.toString().toTitleCase()}
            **Mentionable:** ${role.mentionable.toString().toTitleCase()}`);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};
