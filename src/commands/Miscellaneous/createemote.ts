import {
    ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits,
} from 'discord.js';
import path from 'path';
import logger from '../../logger';
import { fetchEmote } from '../../modules/functions/misc';
import { Command } from '../../modules/interfaces/cmd';
import { ID_REGEX_EXACT } from '../../data/constants';
import emojis from '../../data/emotes';
import CDNUtils from '../../utils/CDNUtils';
import { EmojiUtils, URL_REGEX } from '../../utils/TextUtils';
import { request } from 'undici';

const command: Command = {
    info: {
        name: 'createemote',
        usage: 'createemote [url | emoji | attachment] [name]',
        examples: [
            'createemote :pog: poggers',
            'createemote https://i.imgur.com/H2RlRVJ.gif catjam',
        ],
        description: 'Create an emote from a URL, existing emoji or attachment.',
        category: 'Miscellaneous',
        selfPerms: [
            PermissionFlagsBits.ManageEmojisAndStickers,
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
            name: 'steal',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Steal an emote from another guild',
            options: [{
                name: 'emoji',
                description: 'The emote to steal',
                type: ApplicationCommandOptionType.String,
                required: true,
            }, {
                name: 'name',
                description: 'The new name of the emote (If you wish to change it)',
                type: ApplicationCommandOptionType.String,
                required: false,
            }],
        }, {
            name: 'upload',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Upload an image to create an emote from',
            options: [{
                name: 'emoji',
                description: 'The emote to create',
                type: ApplicationCommandOptionType.Attachment,
                required: true,
            }, {
                name: 'name',
                description: 'The name of the emote (If blank, the file name will be used)',
                type: ApplicationCommandOptionType.String,
                required: false,
            }],
        }, {
            name: 'url',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Create an emote from an image URL',
            options: [{
                name: 'emoji',
                description: 'The emote to create',
                type: ApplicationCommandOptionType.String,
                required: true,
            }, {
                name: 'name',
                description: 'The name of the emote (If blank, the file name will be used)',
                type: ApplicationCommandOptionType.String,
                required: false,
            }],
        }],
        defaultPermission: false,
        dmPermission: false,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const subCmd = interaction.options.getSubcommand();
        await interaction.deferReply();

        if (subCmd === 'steal') {
            const rawEmoji = interaction.options.getString('emoji', true);
            const newName = interaction.options.getString('name');

            let cachedEmoji;

            if (ID_REGEX_EXACT.test(rawEmoji)) {
                // cachedEmoji = bot.emojis.cache.find((rawEmoji as Snowflake));
                console.log(cachedEmoji);
            }

            const emoji = cachedEmoji || EmojiUtils.extractEmoji(rawEmoji);

            // If the emote doesn't match our Regex, then throw an error
            if (!emoji) return interaction.editReply({ content: `${emojis.error} You didn't provide a valid emote!` });

            const url = CDNUtils.emojiUrl(emoji.id, emoji.animated || false);
            const res = await request(url);

            // If the emoji file size is too big, return an error
            if (parseFloat(res.headers['content-length'] as string) > 256 * 1024) return interaction.editReply({ content: 'The emoji is too large! It must be `256KB` or less.' });

            // Convert the emoji to a buffer and grab the emote name
            const buffer = Buffer.from(await res.body.arrayBuffer());

            // Create the emoji
            interaction.guild?.emojis.create({
                name: newName ?? emoji.name,
                attachment: buffer,
                reason: `Created using the createemote command by ${interaction.user.tag}`,
            }).then((e) => {
                interaction.editReply(`${emojis.confirmation} Successfully created the emote: \`:${e.name}:\` ${e}`);
            }).catch((err) => {
                logger.error('Failed to steal emoji:', err);
                interaction.editReply(`${emojis.error} Failed to create the emote: \`${err}\``);
            });
        } else if (subCmd === 'upload') {
            const rawEmoji = interaction.options.getAttachment('emoji', true);
            const newName = interaction.options.getString('name');

            if (!rawEmoji.contentType?.startsWith('image')) return interaction.editReply({ content: "You didn't provide a valid image!" });
            if (rawEmoji.size > 256 * 1024) return interaction.editReply({ content: 'The image is too large! It must be `256KB` or less.'});
            // Create the emoji
            fetchEmote(rawEmoji.proxyURL)
                .then((emote) => {
                    interaction.guild?.emojis.create({
                        attachment: emote,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        name: (newName ?? path.parse(rawEmoji.name!).name).toString(),
                        reason: `Created using the createemote command by ${interaction.user.tag}`,
                    }).then((e) => {
                        interaction.editReply(`${emojis.confirmation} Successfully created the emote: \`:${e.name}:\` ${e}`);
                    }).catch((err) => {
                        interaction.editReply(`${emojis.error} Failed to create the emote: \`${err.message}\``);
                    });
                }).catch((err) => {
                    interaction.editReply(`${emojis.error} Failed to create the emote: \`${err.message}\``);
                });
        } else if (subCmd === 'url') {
            const rawEmoji = interaction.options.getString('emoji', true);
            const newName = interaction.options.getString('name');

            if (!URL_REGEX.test(rawEmoji)) return interaction.editReply(`${emojis.error} You didn't provide a valid URL!`);

            fetchEmote(rawEmoji).then((emote) => {
                interaction.guild?.emojis.create({
                    attachment: emote,
                    name: (newName ?? path.parse(URL.toString()).name).toString(),
                    reason: `Created using the createemote command by ${interaction.user.tag}`,
                }).then((e) => {
                    interaction.editReply(`${emojis.confirmation} Successfully created the emote: \`:${e.name}:\` ${e}`);
                }).catch((err) => {
                    logger.error('Failed to create emote:', err);
                    interaction.editReply(`${emojis.error} Failed to create the emote: \`${err.message}\``);
                });
            }).catch((err) => {
                logger.error('Failed to fetch emote:', err);
                interaction.editReply(`${emojis.error} Failed to create the emote: \`${err.message}\``);
            });
        }
    },
};

export default command;
