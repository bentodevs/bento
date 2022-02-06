import dateFnsTz from 'date-fns-tz';
import { format } from 'date-fns';
import punishments from '../../database/models/punishments.js';
import { punishmentLog } from '../../modules/functions/moderation.js';
import { getMember } from '../../modules/functions/getters.js';
import settings from '../../database/models/settings.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'kick',
        aliases: [],
        usage: 'kick <user> [reason]',
        examples: ['kick @waitrose', 'kick @Jarno bad developer'],
        description: 'Kick a member from the server',
        category: 'Moderation',
        info: null,
        options: [],
    },
    perms: {
        permission: 'KICK_MEMBERS',
        type: 'discord',
        self: [],
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
            name: 'user',
            type: 'USER',
            description: 'The user you wish to kick.',
            required: true,
        }, {
            name: 'reason',
            type: 'STRING',
            description: 'The reason for the kick.',
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        // 1. Get the requested member
        // 2. Define the reason, and set a default if none was provided
        // 3. Get the ID of this action
        const member = await getMember(message, args[0], true);
        const reason = args.slice(1).join(' ') || 'No reason provided';
        const action = await punishments.countDocuments({ guild: message.guild.id }) + 1 || 1;

        // If the member doesn't exist/isn't part of the guild, then return an error
        if (!member) return message.errorReply('That user is not a member of this server!');

        // If the member's ID is the author's ID, then return an error
        if (member.id === message.author.id) return message.errorReply('You are unable to kick yourself!');

        // If the member's highest role is higher than the executors highest role, then return an error
        if (member.roles.highest.position >= message.member.roles.highest.position) return message.errorReply({ content: "Questioning authority are we? Sorry, but this isn't a democracy...", files: ['https://i.imgur.com/K9hmVdA.png'] });

        // If the bot cannot kick the user, then return an error
        if (!member.kickable) return message.errorReply('I am not able to kick this member! *They may have a higher role than me!*');

        try {
            // Try and send the member a DM stating that they were kicked - Catch silently if there is an issue
            await member.send(`:hammer: You have been kicked from **${message.guild.name}** for \`${reason}\``).catch(() => { });

            // kick the member & set the reason
            member.kick({ reason: `[Case: ${action} | ${message.author.tag} on ${format(utcToZonedTime(Date.now(), message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone })}] ${reason}]` });

            // Send a message confirming the action
            message.confirmationReply(`\`${member.user.tag}\` was kicked for **${reason}** *(Case #${action})*`);

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: message.guild.id,
                type: 'kick',
                user: member.id,
                moderator: message.author.id,
                actionTime: Date.now(),
                reason,
            });

            // Send the punishment to the log channel
            const embed = punishmentLog(bot, message, member.user, action, reason, 'kick');

            // Send public kick log message, if it exists
            message.guild.channels.fetch(message.settings.logs?.kick).then((channel) => {
                channel?.send(`👢 **${member.user.tag}** was kicked for **${reason}**`);
            }).catch((err) => {
                if (message.settings.logs?.kick && err.httpStatus === 404) {
                    settings.findOneAndUpdate({ _id: message.guild.id }, { 'logs.kick': null });
                } else {
                    bot.logger.error(err.stack);
                }
            });

            // Send the punishment to the mod log channel
            message.guild.channels.fetch(message.settings.logs?.default).then((channel) => {
                channel?.send({ embeds: [embed] });
            }).catch((err) => {
                if (!message.settings.logs?.default) {
                    settings.findOneAndUpdate({ _id: message.guild.id }, { 'logs.default': null });
                } else {
                    bot.logger.error(err.stack);
                }
            });
        } catch (e) {
            // Catch any errors during the kick process & send error message
            message.errorReply(`There was an issue kicking \`${member.user.tag}\` - \`${e.message}\``);
        }
    },

    run_interaction: async (bot, interaction) => {
        // 1. Get the user from the interaction
        // 2. Get the reason from the interaction, or set to a default if wasn't given
        // 3. Get the punishment ID
        const user = interaction.options.get('user');
        const reason = interaction.options.get('reason')?.value || 'No reason specified';
        const action = await punishments.countDocuments({ guild: interaction.guild.id }) + 1 || 1;

        if (!user.member) return interaction.error('You can only kick server members');

        // If the user they want to kick is themselves, then return an error
        if (interaction.member.id === user.user.id) return interaction.reply('You are unable kick yourself!');

        // If the member's highest role is higher than the executors highest role, then return an error
        if (user.member.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "Questioning authority are we? Sorry, but this isn't a democracy...", files: ['https://i.imgur.com/K9hmVdA.png'] });

        // If the bot cannot kick the user, then return an error
        if (!user.member.kickable) return interaction.error('I am not able to kick this member! *They may have a higher role than me!*');

        try {
            // Try and send the member a DM stating that they were kicked - Catch silently if there is an issue
            await user.member.send(`:hammer: You have been kicked from **${interaction.guild.name}** for \`${reason}\``).catch(() => { });

            // kick the member & set the reason
            user.member.kick({ reason: `[Case: ${action} | ${interaction.member.user.tag} on ${format(utcToZonedTime(Date.now(), interaction.settings.general.timezone), 'PPp (z)', { timeZone: interaction.settings.general.timezone })}] ${reason}]` });

            // Send a message confirming the action
            interaction.confirmation(`\`${user.user.tag}\` was kicked for **${reason}** *(Case #${action})*`);

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: interaction.guild.id,
                type: 'kick',
                user: user.user.id,
                moderator: interaction.member.id,
                actionTime: Date.now(),
                reason,
            });

            // Send the punishment to the log channel
            const embed = punishmentLog(bot, interaction, user, action, reason, 'ban');

            // Send public ban log message, if it exists
            interaction.guild.channels.fetch(interaction.settings.logs?.kick).then((channel) => {
                channel?.send(`👢 **${user.user.tag}** was kicked for **${reason}**`);
            }).catch(() => {
                bot.logger.debug(`Failed to find kick log channel for ${interaction.guild.name} (${interaction.guild.id}) - Removing from Database`);
                settings.findOneAndUpdate({ _id: interaction.guild.id }, { 'logs.kick': null }).catch(() => { });
            });

            // Send the punishment to the mod log channel
            interaction.guild.channels.fetch(interaction.settings.logs?.default).then((channel) => {
                channel?.send({ embeds: [embed] });
            }).catch((err) => {
                if (!interaction.settings.logs?.default) {
                    settings.findOneAndUpdate({ _id: interaction.guild.id }, { 'logs.default': null });
                } else {
                    bot.logger.error(err.stack);
                }
            });
        } catch (e) {
            // Catch any errors during the kick process & send error message
            interaction.error(`There was an issue kicking \`${user.user.tag}\` - \`${e.message}\``);
        }
    },
};
