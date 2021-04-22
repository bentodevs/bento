const { intervalToDuration, formatDuration } = require("date-fns");
const { getSettings } = require("../database/mongo");

module.exports = async (bot, member) => {

    const settings = await getSettings(member.guild.id);

    // Check the member meets the minimum account age requirements
    // If not, then kick them
    if ((Date.now() - member.user.createdTimestamp) < settings.moderation.minimumAge) {
        // Send the User a DM stating that they were kicked for not meeting the minimum age
        await member.send(`:boot: You have been kicked from **${member.guild.name}** as your account does not meet the minimum age requirement! (Minimum age: ${formatDuration(intervalToDuration({ start: 0, end: settings.general.minage }))})`);

        // Kick the user from the Server
        member.kick(`Account does not meet the minimum age requirement. (Created: ${formatDuration(intervalToDuration({ start: member.user.createdTimestamp, end: Date.now() }))} ago)`);

        // Now return
        return;
    }

    // If bot joining is disabled & the user is a bot then kick them
    if (!settings.moderation.bots && member.user.bots)
        return member.kick("Bot joining is currently disabled!");
    
    // Get the welcome channel
    const welcomeChannel = member.guild.channels.cache.get(settings.welcome.channel);

    // If the welcome channel exists and there is a message set in the DB, then send it
    if (welcomeChannel && settings.welcome.joinMessage)
        welcomeChannel.send(settings.welcome.joinMessage);
    
    // If there is a DM message set in the DB, then send it to the user. Silently catch any issues.
    if (settings.welcome.userMessage)
        member.send(settings.welcome.userMessage).catch(() => { });
    
    // Check if there are any roles to auto-assign
    if (settings.roles.auto?.length) {
        // Define the roles array
        const roles = [];

        // Loop through the roles
        for (const data of settings.roles.auto) {
            // Grab the role
            const role = member.guild.roles.cache.get(data);
                    
            // If the role exists push it to the array, if it doesn't exists remove it from the enmap
            if (role) {
                roles.push(role);
            } else {
                await bot.data.settings.findOneAndUpdate({ id: member.guild.id }, {
                    $pull: {
                        "auto.roles": data
                    }
                });
            }
        }

        // Add the roles to the user
        member.roles.add(roles, "Auto Role");
    }

};