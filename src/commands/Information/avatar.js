import { MessageEmbed } from 'discord.js';
import { getMember, getUser } from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'avatar',
        aliases: ['av', 'a'],
        usage: 'avatar [-s] [user]',
        examples: [
            'avatar Jarno',
        ],
        description: 'Display the avatar of a user or yourself.',
        category: 'Information',
        info: "Add `-s` to get the user's server avatar.",
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'user',
            type: 'USER',
            description: "The user who's avatar you want to display.",
            required: false,
        },
        {
            name: 'server',
            type: 'BOOLEAN',
            description: "Display the user's server avatar instead of the user avatar.",
            required: false,
        }],
    },
    context: {
        enabled: true,
    },

    run: async (bot, message, args) => {
        // Get the user
        const target = await getMember(message, (args[0]?.toLowerCase() === '-s' ? args.slice(1).join(' ') : args.join(' ')), true) || await getUser(bot, message, (args[0]?.toLowerCase() === '-s' ? args.slice(1).join(' ') : args.join(' ')), true);

        // If a invalid user was specified return an error
        if (!target) return message.errorReply("You didn't specify a valid user!");

        if (args[0]?.toLowerCase() === '-s') {
            // Build the embed
            const embed = new MessageEmbed()
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setAuthor({ name: `Avatar for ${(target?.user ?? target).tag}`, iconURL: target.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setImage(target.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

            // Send the embed
            message.reply({ embeds: [embed] });
        } else {
            // Build the embed
            const embed = new MessageEmbed()
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setAuthor({ name: `Avatar for ${(target.user ?? target).tag}`, iconURL: (target.user ?? target).displayAvatarURL({ format: 'png', dynamic: true }) })
                .setImage((target?.user ?? target).displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

            // Send the embed
            message.reply({ embeds: [embed] });
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the user
        const target = interaction.options.get('user')?.user ?? interaction.user;
        const server = interaction.options.get('server')?.value;

        if (server && interaction?.guild?.members?.cache?.has(target.id)) {
            if (!interaction.inGuild()) return interaction.error({ content: 'You must run this command in a server to get a guild avatar!', ephemeral: true });

            const guildTarget = interaction.options.get('user')?.member ?? interaction.member;

            // Build the embed
            const embed = new MessageEmbed()
                .setColor(guildTarget.displayColor ?? bot.config.general.embedColor)
                .setAuthor({ name: `Avatar for ${target.tag}`, iconURL: guildTarget.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setImage(guildTarget.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

            // Send the embed
            interaction.reply({ embeds: [embed] });
        } else {
            // Build the embed
            const embed = new MessageEmbed()
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setAuthor({ name: `Avatar for ${target.tag}`, iconURL: target.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setImage(target.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

            if (server && interaction.inGuild()) embed.setDescription(`*${target.tag} is in this server, so their global avatar is below*`);
            if (server && !interaction.inGuild()) embed.setDescription("*Server avatars cannot be fetched in DMs, so the user's global avatar is below*");

            // Send the embed
            interaction.reply({ embeds: [embed] });
        }
    },
};
