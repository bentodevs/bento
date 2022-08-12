import {
    ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import fetch from 'node-fetch';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'imdb',
        usage: 'imdb [-t] [search term]',
        examples: ["imdb The Queen's Gambit", 'imdb -t tt4158110'],
        description: 'Search IMDB for a show/specific title ID',
        category: 'Miscellaneous',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
        ],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        opts: [{
            name: 'query',
            type: ApplicationCommandOptionType.String,
            description: 'The name of the show/movie you are searching or a specific IMDB ID.',
            required: true,
            maxLength: 256,
        }, {
            name: 'id',
            type: ApplicationCommandOptionType.Boolean,
            description: 'Wether or not your query is a IMDB ID.',
            required: true,
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the query, fetch the URL and convert the data to JSON
        const query = interaction.options.getString('query', true);
        const req = await fetch(`https://www.omdbapi.com/?apiKey=${process.env.OMDB_TOKEN}&${interaction.options.getBoolean('id', true) ? 'i' : 't'}=${query}`);
        const json = await req.json();

        // If the response isn't "True" return an error
        if (json.Response !== 'True') return InteractionResponseUtils.error(interaction, 'A film/show could not be found with that name! Make sure your search is accurate and try again!', true);

        // Define the msg var
        let msg = '';

        // Add the data to the msg
        if (json.Year && json.Released) msg += `**Released:** ${json.Released}\n\n`;
        if (json.Year && !json.Released) msg += `**Release Year(s):** ${json.Year}\n\n`;
        if (json.Plot) msg += `**Plot:** ${json.Plot}\n\n`;
        if (json.imdbRating) msg += `**IMDB Rating:** ${json.imdbRating}\n`;
        if (json.Poster) msg += `**Poster Link:** [Click here](${json.Poster})\n`;
        if (json.imdbID) msg += `**IMDB Link:** [Click here](https://www.imdb.com/title/${json.imdbID}/)`;

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: json.Title, iconURL: (json.Poster ?? 'https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png') })
            .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR)
            .setThumbnail((json.Poster ?? 'https://icons.iconarchive.com/icons/flat-icons.com/flat/512/Flat-TV-icon.png'))
            .setDescription(msg)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}` });

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
