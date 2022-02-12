import { intervalToDuration, formatDuration } from 'date-fns';
import settings from '../database/models/settings.js';
import { getSettings } from '../database/mongo.js';
import { getOrdinalSuffix } from '../modules/functions/misc.js';

export default async (bot, member) => {
    // If the member is a partial fetch it
    if (member.partial) {
        try {
            await member.fetch();
        } catch (err) {
            return bot.logger.error(err);
        }
    }

    // Grab the settings
    const serverSettings = await getSettings(member.guild.id);

    // Check the member meets the minimum account age requirements
    // If not, then kick them
    if ((Date.now() - member.user.createdTimestamp) < serverSettings.moderation.minimumAge) {
        // Send the User a DM stating that they were kicked for not meeting the minimum age
        await member.send(`:boot: You have been kicked from **${member.guild.name}** as your account does not meet the minimum age requirement! (Minimum age: ${formatDuration(intervalToDuration({ start: 0, end: serverSettings.moderation.minimumAge }))})`);

        // Kick the user from the Server
        member.kick(`Account does not meet the minimum age requirement. (Created: ${formatDuration(intervalToDuration({ start: member.user.createdTimestamp, end: Date.now() }))} ago)`);

        // Now return
        return;
    }

    // If bot joining is disabled & the user is a bot then kick them
    if (!serverSettings.moderation.bots && member.user.bots) return member.kick('Bot joining is currently disabled!');

    // If the user is in a pending state (Membership screening), then return
    if (member.pending) return;

    // Get the welcome channel
    const welcomeChannel = member.guild.channels.cache.get(serverSettings.welcome.channel);

    // If the welcome channel exists and there is a message set in the DB, then send it
    if (welcomeChannel && serverSettings.welcome.joinMessage) {
        const msg = serverSettings.welcome.joinMessage
            .replace('{id}', member.user.id)
            .replace('{tag}', member.user.tag)
            .replace('{member}', member)
            .replace('{server}', member.guild.name)
            .replace('{formattedCount}', await member.guild.members.fetch().then((a) => a.size + getOrdinalSuffix(a.size)))
            .replace('{count}', await member.guild.members.fetch().then((a) => a.size));

        welcomeChannel.send(msg);
    }

    // If there is a DM message set in the DB, then send it to the user. Silently catch any issues.
    if (serverSettings.welcome.userMessage) {
        const msg = serverSettings.welcome.userMessage
            .replace('{id}', member.user.id)
            .replace('{tag}', member.user.tag)
            .replace('{member}', member)
            .replace('{server}', member.guild.name)
            .replace('{formattedCount}', await member.guild.members.fetch().then((a) => a.size + getOrdinalSuffix(a.size)))
            .replace('{count}', await member.guild.members.fetch().then((a) => a.size));

        member.send(msg).catch(() => { });
    }

    // Check if there are any roles to auto-assign
    if (serverSettings.roles.auto?.length) {
        // Define the roles array
        const roles = [];

        // Loop through the roles
        for (const data of serverSettings.roles.auto) {
            // Grab the role
            const role = member.guild.roles.cache.get(data);

            // If the role exists push it to the array, if it doesn't exists remove it from the db
            if (role) {
                roles.push(role);
            } else {
                await settings.findOneAndUpdate({ id: member.guild.id }, {
                    $pull: {
                        'auto.roles': data,
                    },
                });
            }
        }

        // Add the roles to the user
        member.roles.add(roles, 'Auto Role');
    }
};
