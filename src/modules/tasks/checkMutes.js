const mutes = require('../../database/models/mutes');
const { getSettings } = require('../../database/mongo');
const { punishmentLog } = require('../functions/moderation');

/**
 * Initialize the checkMutes task
 *
 * @param {Object} bot
 */
exports.init = async (bot) => {
    /**
     * Fetch all mutes in the DB and action if the mute has expired
     *
     * @param {Object} bot
     *
     * @returns {Promise<Boolean>} Success/Failure
     */
    // eslint-disable-next-line no-shadow
    const getMutes = async (bot) => {
        const muteData = await mutes.find({});

        for await (const data of muteData) {
            if (data.muteTime !== 'forever') {
                const guild = bot.guilds.cache.get(data.guild);
                const mutedUser = guild?.members.cache.get(data.mutedUser);
                const settings = await getSettings(guild.id);
                const muteRole = guild?.roles.cache.get(settings.roles.mute);
                const dateCalc = data.timeMuted + parseInt(data.muteTime, 10);
                const message = {};

                // eslint-disable-next-line no-return-await
                if (!guild) return await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });

                message.author = 'system';
                message.guild = guild;
                message.settings = settings;

                if (mutedUser && dateCalc <= Date.now()) {
                    await mutedUser.roles.remove(muteRole, ['Mute Expired']);
                    await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });
                    return punishmentLog(message, mutedUser, data.caseID, 'Mute Expired', 'unmute');
                } if (!mutedUser && dateCalc <= Date.now()) {
                    const member = await guild.members.fetch(data.mutedUser).catch(() => { });

                    // eslint-disable-next-line no-return-await
                    if (!member) return await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });

                    await member.roles.remove(muteRole, ['Mute Expired']);
                    // eslint-disable-next-line no-return-await
                    return await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });
                }
            }
        }

        return true;
    };

    // Run the getMutes function
    await getMutes(bot);

    // Run the getMutes function every minute
    const interval = setInterval(async () => {
        await getMutes(bot);
    }, 60000);

    // Return the interval info
    return interval;
};
