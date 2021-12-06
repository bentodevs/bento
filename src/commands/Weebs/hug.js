import { MessageEmbed } from 'discord.js';
import { getMember } from '../../modules/functions/getters.js';
import { fetchWaifuApi } from '../../modules/functions/misc.js';

export default {
    info: {
        name: 'hug',
        aliases: [],
        usage: 'hug [member]',
        examples: [
            'hug @Jarno',
        ],
        description: 'Sends a GIF of an anime character getting hugged.',
        category: 'Weebs',
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
            name: 'member',
            type: 'USER',
            description: 'The member you want to hug.',
            required: false,
        }],
    },

    run: async (bot, message, args) => {
        // Fetch the image
        const URL = await fetchWaifuApi('hug');
        const member = await getMember(message, args.join(' '), true);

        if (!member) return message.errorReply("It doesn't look like that member exists!");

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(message.member?.displayColor || bot.config.general.embedColor);

        // Send the embed
        message.reply({ content: `${member} got hugged`, embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Fetch the image
        const URL = await fetchWaifuApi('hug');
        const member = interaction.options.get('member')?.value ?? interaction.member;

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        interaction.reply({ content: `${member} got hugged`, embeds: [embed] });
    },
};
