import { stripIndents } from 'common-tags';
import {
    ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import users from '../../database/models/users';
import { getLastFMUser, getLastFMUserHistory } from '../../modules/functions/misc';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../modules/structures/constants';
import emojis from '../../modules/structures/emotes';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'lastfm',
        usage: 'lastfm ["set" | "recent"] <last.fm username | discord user>',
        examples: [
            'lastfm',
            'lastfm set BehnH',
            'lastfm recent @Jarno',
        ],
        description: 'Get Last.fm information about a user',
        category: 'Miscellaneous',
        information: 'Using the command with no options will show what you are currently listening to.',
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
            name: 'playing',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View your current Last.fm track',
            options: [],
        }, {
            name: 'set',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Set or view your Last.fm username',
            options: [{
                name: 'username',
                type: ApplicationCommandOptionType.String,
                description: 'The Last.fm username to set',
                required: false,
            }],
        }, {
            name: 'recent',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'View the 10 most recent tracks for yourself or another user',
            options: [{
                name: 'user',
                type: ApplicationCommandOptionType.User,
                description: 'The user to get recent songs for',
                required: false,
            }],
        }],
        defaultPermission: true,
        dmPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        // Get the Subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'playing') {
            // Defer the reply
            await interaction.deferReply();

            // Fetch the user from the DB
            const userData = await users.findOne({ _id: interaction.user.id });

            // If the user doesn't have a lastfm user account set, then return an error
            if (!userData?.accounts?.lastfm) return interaction.editReply({ content: `${emojis.error} You do not have a Last.fm account set!` });

            // 1. Get the user's history
            // 2. Get the latest track from the play history
            getLastFMUserHistory(userData?.accounts?.lastfm).then((history: any) => {
                const latestTrack = history.recenttracks.track[0];

                // If the latest track doesn't have the nowplayig attr, then return
                if (!latestTrack['@attr']?.nowplaying) return interaction.editReply({ content: `${emojis.error} It looks like you aren't playing anything right now!` });

                // Build the embed
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${latestTrack.name} by ${latestTrack.artist?.['#text']}`, iconURL: latestTrack.image[1]['#text'], url: latestTrack.url })
                    .setThumbnail(latestTrack.image[3]['#text'])
                    .setColor((interaction?.member as GuildMember).displayHexColor ?? DEFAULT_COLOR)
                    .setDescription(stripIndents`**Track Name:** ${latestTrack.name}
                **Artist(s):** ${latestTrack.artist?.['#text']}
                **Album:** ${latestTrack.album?.['#text']}`);

                const row = new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel('View on Last.FM')
                            .setURL(latestTrack.url),
                    ],
                });

                // Edit the deferral with the embed
                interaction.editReply({ embeds: [embed], components: [row] });
            }).catch((err) => interaction.editReply({ content: `${emojis.error} I encountered an error getting your play history: ${err}` }));
        } else if (sub === 'set') {
            // 1. Fetch the option
            // 2. Fetch the user's data
            const newName = interaction.options.getString('username');
            const userData = await users.findOne({ _id: interaction.user.id });

            if (!newName) {
                // If the user doesn't have a lastfm account set, return an error
                if (!userData?.accounts?.lastfm) return InteractionResponseUtils.error(interaction, 'You do not have a Last.fm account set!', true);

                // Send the user's Lastfm account
                return InteractionResponseUtils.confirmation(interaction, `Your Last.fm account name is currently set to \`${userData?.accounts?.lastfm}\``, true);
            }
            // Defer the reply and make it ephemeral
            await interaction.deferReply({ ephemeral: true });

            // Define the special chars regex
            const regex = /[!@#$%^&*()+=[\]{};:\\|<>/?~]/;

            // If the user's name has a special char, return an error
            if (regex.test(newName)) return interaction.editReply({ content: `${emojis.error} Your Last.fm username cannot have any special characters!` });

            // Fetch the user's account from Lastfm, catch any errors
            await getLastFMUser(newName)
                .then(async (lfmUsr: any) => {
                    if (lfmUsr && userData) {
                        // Set the account name in the Db
                        await users.findOneAndUpdate({ _id: interaction.user.id }, { 'accounts.lastfm': lfmUsr.user.name });
                        // Edit the deferral and confirm the set username
                        return interaction.editReply({ content: `${emojis.confirmation} I have set your Last.fm name to \`${lfmUsr.user.name}\`` });
                    }

                    // If the user doesn't exist in the DB, then create them
                    await users.create({
                        _id: interaction.user.id,
                        'accounts.lastfm': lfmUsr.user.name,
                    });
                    // Edit the deferral and confirm the set username
                    return interaction.editReply({ content: `${emojis.confirmation} I have set your Last.fm name to \`${lfmUsr.user.name}\`` });
                })
                .catch((err) => interaction.editReply({ content: `${emojis.error} I ran in to an error setting your username: \`${err.message}\`` }));
        } else if (sub === 'recent') {
            // Defer the reply
            await interaction.deferReply();

            const user = interaction.options.getUser('user') ?? interaction.user;
            let dbUsr = await users.findOne({ _id: user.id });
            if (!dbUsr) dbUsr = await users.create({ _id: user.id, accounts: { lastfm: null } });

            if (!dbUsr.accounts?.lastfm) return interaction.editReply({ content: `${emojis.error} That user doesn't have a Last.fm account linked.` });

            await getLastFMUser(dbUsr.accounts?.lastfm)
                .then((lfmUser: any) => {
                    getLastFMUserHistory(lfmUser)
                        .then((history: any) => {
                            const playHistory = history.recenttracks.track.slice(0, 10);
                            const embedDescription = playHistory.map((h) => `[${h.name} by ${h.artist['#text']}](${h.url})`);

                            const embed = new EmbedBuilder()
                                .setAuthor({ name: `Listening history for ${user.tag}`, iconURL: lfmUser.user.image[3]?.['#text'] ?? '' })
                                .setColor(DEFAULT_COLOR)
                                .setDescription(embedDescription.join('\n'))
                                .setFooter({ text: `Requested by ${interaction.user.tag}` });

                            interaction.editReply({ embeds: [embed] });
                        });
                })
                .catch((err: Error) => interaction.editReply({ content: `${emojis.error} I ran in to an error: ${err.message}` }));
        }
    },
};

export default command;
