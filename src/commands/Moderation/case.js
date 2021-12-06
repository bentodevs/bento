import { stripIndents } from 'common-tags';
import { formatDistanceStrict, format } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { MessageEmbed } from 'discord.js';
import punishments from '../../database/models/punishments.js';
import { getMember, getUser } from '../../modules/functions/getters.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'case',
        aliases: ['hist', 'history'],
        usage: 'case <case id or user> [page]',
        examples: ['case'],
        description: 'View a specific punishment or punishments for a user',
        category: 'Moderation',
        info: null,
        options: [],
    },
    perms: {
        permission: 'KICK_MEMBERS',
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
            name: 'list',
            type: 'SUB_COMMAND',
            description: 'View all punishments for a user',
            options: [{
                name: 'user',
                type: 'USER',
                description: 'The user to lookup.',
                required: true,
            }, {
                name: 'page',
                type: 'INTEGER',
                description: 'The page to view.',
                required: false,
            }],
        }, {
            name: 'info',
            type: 'SUB_COMMAND',
            description: 'Get case specific information.',
            options: [{
                name: 'case',
                type: 'INTEGER',
                description: 'The case to view.',
                required: true,
            }],
        }],
    },

    run: async (bot, message, args) => {
        if (!isNaN(args[0]) && /^[0-9]{16,}$/.test(args[0])) {
            // Try and fetch a guild member from args[0]
            const member = await getMember(message, args[0], false) || await getUser(bot, message, args[0], false);

            // If there was no member returned, then send an error
            if (!member) return message.errorReply("I couldn't find a user with that ID!");

            // Fetch all punishments from this guild for this user
            const entries = await punishments.find({ guild: message.guild.id, user: member.id });

            // If the returned array is empty, then send an error
            if (entries.length === 0) return message.errorReply("This user doesn't have any punishments recorded!");

            // Page variables
            const pages = [];
            let page = 0;

            // Reverse sort the entries (Newest first)
            const casesSorted = entries.sort((a, b) => b.actionTime - a.actionTime);

            // Set cases in page array
            for (let i = 0; i < casesSorted.length; i += 10) {
                pages.push(casesSorted.slice(i, i + 10));
            }

            // Get the correct page, if the user provides a page number
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (!isNaN(args[1])) page = args[1] -= 1;

            // Check if the user specified a valid page
            if (!pages[page]) return message.errorReply("You didn't specify a valid page!");

            // Format the cases
            const formatted = pages[page].map((p) => `**#${p.id}** | **${p.type.toTitleCase()}** | **Reason:** ${p.reason} | ${format(utcToZonedTime(p.actionTime, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone })}`);

            // Build the history embed
            const embed = new MessageEmbed()
                .setAuthor(`Punishment History for ${member.user?.tag ?? member.tag}`, (member?.user ?? member).displayAvatarURL({ format: 'png', dynamic: true }))
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setDescription(formatted.join('\n'))
                .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);

            message.reply({ embeds: [embed] });
        } else if (!isNaN(args[0])) {
            // We are now presuming the number provided is a Case ID...
            // Lookup the case in the punishments DB
            const punishment = await punishments.findOne({ guild: message.guild.id, id: args[0] });

            // If the punishment doesn't exist, then return an error
            if (!punishment) return message.errorReply('A punishment with that ID was not found!');

            const usr = await getUser(bot, message, punishment.user);
            const mod = await getUser(bot, message, punishment.moderator);

            // Build the embed
            // "mute" is only added when the punishment type is a mute (Semi-obvious tbh...)
            const embed = new MessageEmbed()
                .setAuthor(`Case #${punishment.id} - ${punishment.type.toTitleCase()}`, usr.displayAvatarURL({ format: 'png', dynamic: true }))
                .setColor((message.member.displayColor ? message.member.displayColor : '#B00B1E'))
                .setDescription(stripIndents`**User:** \`${usr.tag}\`
                **Moderator:** \`${mod.tag}\`
                **Reason:** ${punishment.reason}
                ${punishment.type === 'mute' ? `**Duration:** ${punishment.muteTime === 'forever' ? 'never' : `${formatDistanceStrict(parseInt(punishment.actionTime, 10), parseInt(punishment.actionTime, 10) + parseInt(punishment.muteTime, 10))}`}` : ''}`)
                .setTimestamp(punishment.actionTime)
                .setThumbnail(usr.displayAvatarURL({ format: 'png', dynamic: true }))
                .setFooter(`Requested by ${message.author.tag}`);

            // Send the embed
            message.reply({ embeds: [embed] });
        } else {
            // Try and fetch a guild member from args[0]
            const member = await getMember(message, args[0], false) || await getUser(bot, message, args[0], false);

            if (!member) return message.errorReply('You did not specify a valid member!');

            // Fetch all punishments from this guild for this user
            const entries = await punishments.find({ guild: message.guild.id, user: member.id });

            // If the returned array is empty, then send an error
            if (entries.length === 0) return message.errorReply("This user doesn't have any punishments recorded!");

            // Page variables
            const pages = [];
            let page = 0;

            // Reverse sort the entries (Newest first)
            const casesSorted = entries.sort((a, b) => b.actionTime - a.actionTime);

            // Set cases in page array
            for (let i = 0; i < casesSorted.length; i += 10) {
                pages.push(casesSorted.slice(i, i + 10));
            }

            // Get the correct page, if the user provides a page number
            // eslint-disable-next-line no-multi-assign, no-param-reassign
            if (!isNaN(args[1])) page = args[1] -= 1;

            // Check if the user specified a valid page
            if (!pages[page]) return message.errorReply("You didn't specify a valid page!");

            // Format the cases
            const formatted = pages[page].map((p) => `**#${p.id}** | **${p.type.toTitleCase()}** | **Reason:** ${p.reason} | ${format(utcToZonedTime(p.actionTime, message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone })}`);

            // Build the history embed
            const embed = new MessageEmbed()
                .setAuthor(`Punishment History for ${member.user?.tag ?? member.tag}`, (member?.user ?? member).displayAvatarURL({ format: 'png', dynamic: true }))
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setDescription(formatted.join('\n'))
                .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);

            message.reply({ embeds: [embed] });
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'list') {
            // Try and fetch a guild member from args[0]
            const member = interaction.options.get('user');
            const int = interaction?.options?.get('page');

            // If there was no member returned, then send an error
            if (!member) return interaction.error({ content: "I don't recognise a user with that ID!", ephemeral: true });

            // Fetch all punishments from this guild for this user
            const entries = await punishments.find({ guild: interaction.guild.id, user: member.user.id });

            // If the returned array is empty, then send an error
            if (entries.length === 0) return interaction.error({ content: "That user doesn't have any punishments!", ephemeral: true });

            // Page variables
            const pages = [];
            let page = 0;

            // Reverse sort the entries (Newest first)
            const casesSorted = entries.sort((a, b) => b.actionTime - a.actionTime);

            // Set cases in page array
            for (let i = 0; i < casesSorted.length; i += 10) {
                pages.push(casesSorted.slice(i, i + 10));
            }

            // If args[0] is a number set it as the page
            // eslint-disable-next-line no-multi-assign
            if (int) page = int.value -= 1;

            // Check if the user specified a valid page
            if (!pages[page]) return interaction.error({ content: "You didn't specify a valid page!", ephemeral: true });

            // Format the cases
            const formatted = pages[page].map((p) => `**#${p.id}** | **${p.type.toTitleCase()}** | **Reason:** ${p.reason} | ${format(utcToZonedTime(p.actionTime, interaction.settings.general.timezone), 'PPp (z)', { timeZone: interaction.settings.general.timezone })}`);

            // Build the history embed
            const embed = new MessageEmbed()
                .setAuthor(`Punishment History for ${member.user.tag}`, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
                .setColor(member.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(formatted.join('\n'))
                .setFooter(`Use this command with a number for specific case info | Page ${page + 1} of ${pages.length}`);

            interaction.reply({ embeds: [embed] });
        } else if (sub === 'info') {
            const int = interaction.options.get('case');

            // Lookup the case in the punishments DB
            const punishment = await punishments.findOne({ guild: interaction.guild.id, id: int.value });

            // If the punishment doesn't exist, then return an error
            if (!punishment) return interaction.error({ content: 'A punishment with that ID was not found!', ephemeral: true });

            const usr = await getUser(bot, interaction, punishment.user);
            const mod = await getUser(bot, interaction, punishment.moderator);

            // Build the embed
            // "mute" is only added when the punishment type is a mute (Semi-obvious tbh...)
            const embed = new MessageEmbed()
                .setAuthor(`Case #${punishment.id} - ${punishment.type.toTitleCase()}`, usr.displayAvatarURL({ format: 'png', dynamic: true }))
                .setColor(interaction.member.displayColor ?? bot.config.general.embedColor)
                .setDescription(stripIndents`**User:** \`${usr.tag}\`
                **Moderator:** \`${mod.tag}\`
                **Reason:** ${punishment.reason}
                ${punishment.type === 'mute' ? `**Duration:** ${punishment.muteTime === 'forever' ? 'never' : `${formatDistanceStrict(parseInt(punishment.actionTime, 10), parseInt(punishment.actionTime, 10) + parseInt(punishment.muteTime, 10))}`}` : ''}`)
                .setTimestamp(punishment.actionTime)
                .setThumbnail(usr.displayAvatarURL({ format: 'png', dynamic: true }))
                .setFooter(`Requested by ${interaction.member.user.tag}`);

            // Send the embed
            interaction.reply({ embeds: [embed] });
        }
    },
};
