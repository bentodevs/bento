import { EmbedBuilder, GuildMember, PermissionFlagsBits } from 'discord.js';
import { getMeme } from '../../modules/functions/misc.js';
import { Command } from '../../modules/interfaces/cmd.js';
import { DEFAULT_COLOR } from '../../data/constants.js';

const command: Command = {
    info: {
        name: 'meme',
        usage: '',
        examples: [],
        description: 'Sends a random meme.',
        category: 'Fun',
        information: 'Memes are taken from the following subreddits: [r/memes](https://www.reddit.com/r/memes), [r/dankmemes](https://www.reddit.com/r/dankmemes), [r/wholesomememes](https://www.reddit.com/r/wholesomememes), [r/BikiniBottomTwitter](https://www.reddit.com/r/BikiniBottomTwitter), [r/funny](https://www.reddit.com/r/funny)',
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
        opts: [],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Defer the interaction
        await interaction.deferReply();

        // Get a random meme
        getMeme().then((meme) => {
            // Build the embed
            const embed = new EmbedBuilder()
                .setColor(DEFAULT_COLOR)
                .setImage(meme.data.url)
                .setDescription(`[${meme.data.title}](https://www.reddit.com/${meme.data.permalink})`)
                .setFooter({ text: meme.data.subreddit_name_prefixed, iconURL: bot.user?.displayAvatarURL() });

            // Send the embed
            interaction.editReply({ embeds: [embed] });
        });
    },
};

export default command;
