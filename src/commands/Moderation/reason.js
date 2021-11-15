const punishments = require('../../database/models/punishments');

module.exports = {
    info: {
        name: 'reason',
        aliases: [],
        usage: 'reason <case> <reason>',
        examples: ['reason 69 Reason v2 lol'],
        description: 'Update the reason for a moderation case',
        category: 'Moderation',
        info: null,
        options: [],
    },
    perms: {
        permission: 'MANAGE_MESSAGES',
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
            name: 'case',
            type: 'INTEGER',
            description: 'The user you wish to mute.',
            required: true,
        }, {
            name: 'reason',
            type: 'STRING',
            description: 'Nickname you wish to set (Do not enter anything to remove the nickname)',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        const punishment = await punishments.findOne({ id: args[0], guild: message.guild.id });

        if (!punishment) return message.errorReply('You must specify a valid case!');

        if (!args[1]) return message.errorReply('You must provice a new punishment reason!');

        const reason = args.splice(1).join(' ');

        await punishments.findOneAndUpdate({ id: args[0], guild: message.guild.id }, { reason })
            .then(() => message.confirmation(`The reason for ${punishment.id} has been updated to ${reason}`))
            .catch((err) => message.error(`I encountered an error whilst updating the reason for ${punishment.id}: \`${err.message}\``));
    },

    run_interaction: async (bot, interaction) => {
        // Get the member and the nick
        const caseID = interaction.options.get('case').value;
        const reason = interaction.options.get('reason').value;

        const punishment = await punishments.findOne({ id: caseID, guild: interaction.guild.id });

        if (!punishment) return interaction.error('You must specify a valid case!');

        await punishments.findOneAndUpdate({ id: caseID, guild: interaction.guild.id }, { reason })
            .then(() => interaction.confirmation(`The reason for Case ID ${punishment.id} has been updated to ${reason}`))
            .catch((err) => interaction.error(`I encountered an error whilst updating the reason for ${punishment.id}: \`${err.message}\``));
    },
};
