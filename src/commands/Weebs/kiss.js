import { MessageEmbed } from 'discord.js';
import { getMember } from '../../modules/functions/getters.js';
import { fetchWaifuApi } from '../../modules/functions/misc.js';

export default {
    info: {
        name: 'kiss',
        aliases: [],
        usage: 'kiss <member>',
        examples: [
            'kiss @Jarno',
        ],
        description: 'Sends a GIF of anime characters kissing.',
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
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'member',
            type: 'USER',
            description: 'The member you want to bonk.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // Fetch the image
        const URL = await fetchWaifuApi('kiss');
        const member = await getMember(message, args.join(' '), true);

        if (!member) return message.errorReply("It doesn't look like that member exists!");

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(message.member?.displayColor || bot.config.general.embedColor);

        // Send the embed
        message.reply({ content: `${message.member} kissed ${member}`, embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Fetch the image
        const URL = await fetchWaifuApi('kiss');
        const { member } = interaction.options.get('member');

        // Build the embed
        const embed = new MessageEmbed()
            .setImage(URL)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor);

        // Send the embed
        interaction.reply({ content: `${interaction.member} kissed ${member}`, embeds: [embed] });
    },
};
