import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';

export default {
    info: {
        name: 'pokemon',
        aliases: [
            'poke',
            'pokedex',
        ],
        usage: 'pokemon <pokemon>',
        examples: [
            'pokemon Pikachu',
            'pokemon Mewtwo',
        ],
        description: 'Display info about a specific pokemon.',
        category: 'Miscellaneous',
        info: null,
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
            name: 'pokemon',
            type: 'STRING',
            description: 'The name of the pokemon.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // Get the pokemon data
        const data = await bot.pokedex.getPokemonByName(args.join(' ')).then((d) => d).catch(() => {
            // Return an error
            message.errorReply("I couldn't find the pokemon you specified!");
        });

        // If no data was found return
        if (!data) return;

        // Build the embed
        const embed = new MessageEmbed()
            .setTitle(data.name.toTitleCase())
            .setDescription(stripIndents`⚖️ **Weight:** ${data.weight}
            📏 **Height:** ${data.height}
            🗂️ **Types:** ${data.types.map((a) => a.type.name).join(', ')}`)
            .setThumbnail(data.sprites.other['official-artwork'].front_default)
            .setColor(bot.config.general.embedColor);

        // Add the pokemon stats
        for (const b of data.stats.filter((a) => a.base_stat)) {
            embed.addField(b.stat.name.toTitleCase(), b.base_stat.toString(), true);
        }

        // Send the message
        message.reply({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Get the pokemon data
        const data = await bot.pokedex.getPokemonByName(interaction.options.get('pokemon').value).then((d) => d).catch(() => {
            // Return an error
            interaction.error("I couldn't find the pokemon you specified!");
        });

        // If no data was found return
        if (!data) return;

        // Build the embed
        const embed = new MessageEmbed()
            .setTitle(data.name.toTitleCase())
            .setDescription(stripIndents`⚖️ **Weight:** ${data.weight}
            📏 **Height:** ${data.height}
            🗂️ **Types:** ${data.types.map((a) => a.type.name).join(', ')}`)
            .setThumbnail(data.sprites.other['official-artwork'].front_default)
            .setColor(bot.config.general.embedColor);

        // Add the pokemon stats
        for (const b of data.stats.filter((a) => a.base_stat)) {
            embed.addField(b.stat.name.toTitleCase(), b.base_stat.toString(), true);
        }

        // Send the message
        interaction.reply({ embeds: [embed] });
    },
};
