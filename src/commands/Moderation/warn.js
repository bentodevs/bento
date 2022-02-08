import punishments from '../../database/models/punishments.js';
import settings from '../../database/models/settings.js';
import { getMember } from '../../modules/functions/getters.js';
import { punishmentLog } from '../../modules/functions/moderation.js';

export default {
    info: {
        name: 'warn',
        aliases: [],
        usage: 'warn <member> [reason]',
        examples: [
            'warn @jarno posting anime',
        ],
        description: 'Warn a user',
        category: 'Moderation',
        info: null,
        options: [],
    },
    perms: {
        permission: 'BAN_MEMBERS',
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
        opts: [
            {
                name: 'member',
                type: 'USER',
                description: 'The user you wish to warn.',
                required: true,
            },
            {
                name: 'reason',
                type: 'STRING',
                description: 'The reason for the warn.',
                required: false,
            },
        ],
    },

    run: async (bot, message, args) => {
        // Get the member
        const member = await getMember(message, args[0], false);
        // Get the reason, or provide a default
        const reason = args.slice(1, args.length).join(' ') || 'No reason provided';
        // Get the punishment count + 1
        const action = await punishments.countDocuments({ guild: message.guild.id }) + 1 || 1;

        // If no member was found return an error
        if (!member || member?.bot) return message.errorReply("You didn't specify a valid member!");

        // If the member has a higher role than the author, return an error
        if (member.roles.highest.position >= message.member.roles.highest.position) return message.errorReply({ content: "Questioning authority are we? Sorry, but this isn't a democracy...", files: ['https://i.imgur.com/K9hmVdA.png'] });

        // Create the punishment
        await punishments.create({
            id: action,
            guild: message.guild.id,
            type: 'warn',
            user: member.id,
            moderator: message.author.id,
            actionTime: Date.now(),
            reason,
        });

        // Send a message to the user, if they have DMs disabled then send a message in the current channel
        member.send(`${bot.config.emojis.warning} You have been warned in **${message.guild.name}** for **${reason}**`)
            .catch(() => message.channel.send(`${bot.config.emojis.warning} ${member}, you have been warned for **${reason}**`));

        // Create the modlog message
        const logMessage = punishmentLog(bot, message, member, action, reason, 'warn');

        // Send the log message
        message.guild.channels.fetch(message.settings.logs?.default).then((channel) => {
            channel.send({ embeds: [logMessage] });
        }).catch(async (err) => {
            if (message.settings.logs?.default && err?.httpStatus === 404) {
                await settings.findOneAndUpdate({ _id: message.guild.id }, { 'logs.default': null });
            } else if (message.settings.logs?.default) {
                bot.logger.error(err);
            }
        });

        // Reply to the moderator
        message.confirmationReply(`${member.user.tag} was warned for **${reason}** *(Case #${action})*`);
    },

    run_interaction: async (bot, interaction) => {
        // Get the member
        const member = interaction.options.get('member');
        // Get the reason, or provide a default
        const reason = interaction.options.get('reason')?.value || 'No reason provided';
        // Get the punishment count + 1
        const action = await punishments.countDocuments({ guild: interaction.guild.id }) + 1 || 1;

        // If no member was found return an error
        if (!member?.member || member?.bot) return interaction.error("You didn't specify a valid member!");

        // If the member has a higher role than the author, return an error
        if (member.member.roles.highest.position >= interaction.member.roles.highest.position) return interaction.error({ content: "Questioning authority are we? Sorry, but this isn't a democracy...", ephemeral: true });

        // Create the punishment
        await punishments.create({
            id: action,
            guild: interaction.guild.id,
            type: 'warn',
            user: member.member.id,
            moderator: interaction.user.id,
            actionTime: Date.now(),
            reason,
        });

        // Send a message to the user, if they have DMs disabled then send a message in the current channel
        member.member.send(`${bot.config.emojis.warning} You have been warned in **${interaction.guild.name}** for **${reason}**`)
            .catch(() => interaction.channel.send(`${bot.config.emojis.warning} ${member.member}, you have been warned for **${reason}**`));

        // Create the modlog message
        const logMessage = punishmentLog(bot, interaction, member.member, action, reason, 'warn');

        // Send the log message
        interaction.guild.channels.fetch(interaction.settings.logs.default).then((channel) => {
            channel.send({ embeds: [logMessage] });
        }).catch((err) => {
            if (!interaction.settings.logs?.default) {
                settings.findOneAndUpdate({ _id: interaction.guild.id }, { 'logs.default': null });
            } else if (interaction.settings.logs?.default) {
                bot.logger.error(err);
            }
        });

        // Reply to the moderator
        interaction.confirmation(`${member.user.tag} was warned for **${reason}** *(Case #${action})*`);
    },
};
