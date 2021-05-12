const mutes = require("../../database/models/mutes");
const { getSettings } = require("../../database/mongo");
const { punishmentLog } = require("../functions/moderation");

/**
 * Initialize the checkMutes task
 * 
 * @param {Object} bot 
 */
exports.init = async bot => {
    /**
     * Fetch all mutes in the DB and action if the mute has expired
     * 
     * @param {Object} bot 
     * 
     * @returns {Promise<Boolean>} Success/Failure
     */
    const getMutes = async (bot) => {
        const muteData = await mutes.find({});

        for await (const data of muteData) {
            if (data.muteTime !== "forever") {
                const guild = bot.guilds.cache.get(data.guild),
                    mutedUser = guild?.members.cache.get(data.mutedUser),
                    settings = await getSettings(data, guild),
                    muteRole = guild?.roles.cache.get(settings.roles.mute),
                    dateCalc = data.timeMuted + parseInt(data.muteTime),
                    message = {};
                
                if (!guild)
                    return await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });
                
                message.author = "system";
                message.guild = guild;
                message.settings = settings;

                if (mutedUser && dateCalc <= Date.now()) {
                    await mutedUser.roles.remove(muteRole, ["Mute Expired"]);
                    await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });
                    return punishmentLog(message, mutedUser, data.caseID, "Mute Expired", "unmute");
                } else if (!mutedUser && dateCalc <= Date.now()) {
                    const member = await guild.members.fetch(data.mutedUser).catch(() => { });

                    if (!member)
                        return await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });
                    
                    await member.roles.remove(muteRole, ["Mute Expired"]);
                    return await mutes.findOneAndDelete({ guild: data.guild, mutedUser: data.mutedUser });
                }
            }
        }
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