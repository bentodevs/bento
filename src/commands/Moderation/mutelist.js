import { format, formatDistance } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import mutes from '../../database/models/mutes.js';
import { getUser } from '../../modules/functions/getters.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'mutelist',
        aliases: [],
        usage: 'mutelist',
        examples: [],
        description: 'View the list of currently muted users',
        category: 'Moderation',
        info: null,
        options: [],
    },
    perms: {
        permission: 'MANAGE_MESSAGES',
        type: 'discord',
        self: [],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [],
    },

    run: async (bot, message) => {
        // Find all mutes with the guild ID set as their guild value
        const mutedata = await mutes.find({ guild: message.guild.id });
        // Define mute list text
        let muteList = `🔇 Muted users as of **${format(utcToZonedTime(Date.now(), message.settings.general.timezone), 'PPp (z)', { timeZone: message.settings.general.timezone })}**\n\n`;

        // If there are no mutes, then return error
        if (mutedata.length < 1) return message.errorReply('There currently aren\'t any muted members!');

        for (const data of mutedata) {
            // 1. Get the muted user
            // 2. Get the executor
            // 3. Add the time muted for to the mute time
            const mUser = await getUser(bot, message, data.mutedUser);
            const mBy = await getUser(bot, message, data.mutedBy);
            const time = data.timeMuted + parseInt(data.muteTime, 10);

            // eslint-disable-next-line no-nested-ternary
            muteList += `${data.caseID ? `**ID:** ${data.caseID} | ` : ''}**User:** \`${mUser.tag}\` (${mUser.id}) | **Muted By:** \`${mBy.tag}\` | **Expires:** ${data.muteTime === 'forever' ? 'never' : time <= Date.now() ? '<Pending Unmute>' : `in ${formatDistance(Date.now(), time)}`} | **Reason:** ${data.reason}\n`;
        }

        // Send the completed message
        message.reply(muteList, { split: { char: '\n' } });
    },

    run_interaction: async (bot, interaction) => {
        // Find all mutes with the guild ID set as their guild value
        const mutedata = await mutes.find({ guild: interaction.guild.id });
        // Define mute list text
        let muteList = `🔇 Muted users as of **${format(utcToZonedTime(Date.now(), interaction.settings.general.timezone), 'PPp (z)', { timeZone: interaction.settings.general.timezone })}**\n\n`;

        // If there are no mutes, then return error
        if (mutedata.length < 1) return interaction.error('There currently aren\'t any muted members!');

        for (const data of mutedata) {
            // 1. Get the muted user
            // 2. Get the executor
            // 3. Add the time muted for to the mute time
            const mUser = await (bot.users.cache.get(data.mutedUser) || bot.users.fetch(data.mutedUser).catch(() => { }));
            const mBy = await (bot.users.cache.get(data.mutedBy) || bot.users.fetch(data.mutedBy).catch(() => { }));
            const time = data.timeMuted + parseInt(data.muteTime, 10);

            // eslint-disable-next-line no-nested-ternary
            muteList += `${data.caseID ? `**ID:** ${data.caseID} | ` : ''}**User:** \`${mUser.tag}\` (${mUser.id}) | **Muted By:** \`${mBy.tag}\` | **Expires:** ${data.muteTime === 'forever' ? 'never' : time <= Date.now() ? '<Pending Unmute>' : `in ${formatDistance(Date.now(), time)}`} | **Reason:** ${data.reason}\n`;
        }

        // Send the completed message
        interaction.reply(muteList, { split: { char: '\n' } });
    },
};
