import { intervalToDuration, formatDuration } from 'date-fns';
import {
    Client, GuildMember, GuildTextBasedChannel, Role,
} from 'discord.js';
import settings from '../database/models/settings.js';
import { getSettings } from '../database/mongo.js';
import logger from '../logger';
import { getOrdinalSuffix } from '../modules/functions/misc.js';

export default async (bot: Client, member: GuildMember) => {
    // If the member is a partial fetch it
    if (member.partial) {
        try {
            await member.fetch();
        } catch (err) {
            return logger.error(err);
        }
    }

    // Grab the settings
    const sets = await getSettings(member.guild.id);

    // Check the member meets the minimum account age requirements
    // If not, then kick them
    if (sets.moderation.minimumAge && (Date.now() - member.user.createdTimestamp) < parseFloat(sets.moderation.minimumAge ?? '0')) {
        // Send the User a DM stating that they were kicked for not meeting the minimum age
        await member.send(`:boot: You have been kicked from **${member.guild.name}** as your account does not meet the minimum age requirement! (Minimum age: ${formatDuration(intervalToDuration({ start: 0, end: (parseFloat(sets.moderation.minimumAge) ?? 0) }))})`);

        // Kick the user from the Server
        member.kick(`Account does not meet the minimum age requirement. (Created: ${formatDuration(intervalToDuration({ start: member.user.createdTimestamp, end: Date.now() }))} ago)`);

        // Now return
        return;
    }

    // If the user is in a pending state (Membership screening), then return
    if (member.pending) return;

    if (sets.welcome.channel) {
        const welcomeChannel = member.guild.channels.cache.get(sets.welcome.channel);
        const memberCount = (await member.guild.members.fetch().then((a) => a.size)).toString();

        // If the welcome channel exists and there is a message set in the DB, then send it
        if (sets.welcome.joinMessage) {
            const msg = sets.welcome.joinMessage
                .replace('{id}', member.user.id)
                .replace('{tag}', member.user.tag)
                .replace('{member}', `<@${member.user.id}>`)
                .replace('{server}', member.guild.name)
                .replace('{formattedCount}', (memberCount + getOrdinalSuffix(parseFloat(memberCount))))
                .replace('{count}', memberCount);

            (welcomeChannel as GuildTextBasedChannel).send(msg);

            member.guild.channels.fetch(sets.welcome.channel).then((channel) => {
                (channel as GuildTextBasedChannel)?.send(msg);
            }).catch(async (err) => {
                if (sets.welcome.channel && err.httpStatus === 404) {
                    await settings.findOneAndUpdate({ _id: member.guild.id }, { 'sets.welcome.channel': null });
                } else if (sets.logs?.punishments.channel) {
                    logger.log('error', 'Failed to send Welcome message to channel', err);
                }
            });
        }
    }

    // If there is a DM message set in the DB, then send it to the user. Silently catch any issues.
    if (sets.welcome.userMessage) {
        const msg = sets.welcome.userMessage
            .replace('{id}', member.user.id)
            .replace('{tag}', member.user.tag)
            .replace('{member}', `<@${member.user.id}>`)
            .replace('{server}', member.guild.name)
            .replace('{formattedCount}', (member.guild.memberCount + getOrdinalSuffix(member.guild.memberCount)))
            .replace('{count}', member.guild.memberCount.toString());

        member.send(msg).catch(() => {
            logger.debug('Failed to send Welcome message to user');
        });
    }

    // Check if there are any roles to auto-assign
    if (sets.roles?.length) {
        // Define the roles array
        const roles: Role[] = [];

        // Loop through the roles
        for (const data of sets.roles) {
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
        member.roles.add(roles, '[BentoBot] Task: Auto-assign configured roles');
    }
};
