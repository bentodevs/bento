import {
    ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, GuildMember,
} from 'discord.js';
import { urban } from '../../modules/functions/misc';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';
import emojis from '../../modules/structures/emotes';
import { UrbanDictionaryDefinitionElement } from '../../types';

const command: Command = {
    info: {
        name: 'urbandictionary',
        usage: 'urbandictionary <query>',
        examples: [
            'urbandictionary lol',
            'urbandictionary weeb',
        ],
        description: 'Search for things on the Urban Dictionary.',
        category: 'Fun',
        selfPerms: [],
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
            description: 'The query to search for.',
            required: true,
        }],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Defer the interaction
        await interaction.deferReply();

        urban((interaction.options.get('query')?.value as string))
            .then((result) => {
                const {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    word, permalink, definition, example, thumbs_down, thumbs_up,
                }: UrbanDictionaryDefinitionElement = result;

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Urban Dictionary: ${word}`, iconURL: 'https://i.imgur.com/kwkO5eD.jpg', url: permalink })
                    .setThumbnail('https://i.imgur.com/kwkO5eD.jpg')
                    .setDescription(`${definition.length >= 2000 ? `Definition is too large to display in a single message. [Click here](${permalink}) to view it on the site.` : definition}\n\n${example}\n\n👍 ${thumbs_up} 👎 ${thumbs_down} | [See all results](https://www.urbandictionary.com/define.php?term=${interaction.options.getString('query', true).split(' ').join('_')})`)
                    .setColor((interaction.member as GuildMember)?.displayHexColor ?? DEFAULT_COLOR);

                interaction.editReply({ embeds: [embed] });
            })
            .catch((err) => interaction.editReply(`${emojis.error} I ran into an error while searching for that: ${err.message}`));
    },
};

export default command;
