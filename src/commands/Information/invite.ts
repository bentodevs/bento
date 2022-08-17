import {
    NewsChannel, PermissionFlagsBits, TextChannel, VoiceChannel,
} from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';

const command: Command = {
    info: {
        name: 'invite',
        usage: '',
        examples: [],
        description: 'Creates a permanent guild invite. (or sends an existing one)',
        category: 'Information',
        selfPerms: [
            PermissionFlagsBits.CreateInstantInvite,
        ],
    },
    opts: {
        guildOnly: true,
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
        defaultPermission: false,
        dmPermission: false,
    },

    run: async (bot, interaction) => {
        if (interaction.guild?.vanityURLCode) {
            // If the guild has a vanity URL send it
            interaction.reply(`https://discord.gg/${interaction.guild.vanityURLCode}`);
        } else {
            // Create a permanent invite and send it
            (interaction.channel as NewsChannel | TextChannel | VoiceChannel)?.createInvite({ maxAge: 0 }).then((invite) => {
                interaction.reply(invite.toString());
            }).catch((err) => {
                InteractionResponseUtils.error(interaction, `Something went wrong while creating the invite: \`${err.message}\``, true);
            });
        }
    },
};

export default command;
