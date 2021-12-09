import users from '../../database/models/users.js';
import { getMember } from '../../modules/functions/getters.js';
import { getRankCard } from '../../modules/functions/leveling.js';

export default {
    info: {
        name: 'level',
        aliases: [
            'lvl',
            'checklevel',
            'xp',
            'rank',
        ],
        usage: 'level [user]',
        examples: [
            'level @Jarno',
        ],
        description: 'View the current level of a user.',
        category: 'Information',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [{
            name: 'user',
            type: 'USER',
            description: "The user who's level you want to see.",
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        const user = await getMember(message, args.join(' '), true);
        const apiUser = await bot.users.fetch(user.id, { force: true });

        if (!user) return message.errorReply("You didn't specify a valid member!");

        const data = await users.findOne({ _id: user.id, 'guilds.id': message.guild.id });
        const gData = data?.guilds.find((g) => g.id === message.guild.id);

        if (!data) return message.errorReply("I couldn't find any data for the member you specified!");

        const xd = await getRankCard(user, gData, message.guild.id, apiUser);

        message.reply({ files: [xd] });
    },

    run_interaction: async (bot, interaction) => {
        const user = interaction.options?.get('user')?.member ?? interaction.member;
        const apiUser = await bot.users.fetch(user.id, { force: true });

        if (!user) return interaction.error("You didn't specify a valid member!");

        const data = await users.findOne({ _id: user.id, 'guilds.id': interaction.guild.id });
        const gData = data?.guilds.find((g) => g.id === interaction.guild.id);

        if (!data) return interaction.error("I couldn't find any data for the member you specified!");

        const xd = await getRankCard(user, gData, interaction.guild.id, apiUser);

        interaction.reply({ files: [xd] });
    },
};
