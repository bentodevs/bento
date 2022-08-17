import { Client, GuildMember, GuildTextBasedChannel } from 'discord.js';
import { getSettings } from '../database/mongo.js';
import logger from '../logger';

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
    const settings = await getSettings(member.guild.id);

    if (settings.welcome.channel && settings.welcome.leaveMessage) {
        const welcomeChannel = member.guild.channels.cache.get(settings.welcome.channel);
        const memberCount = (await member.guild.members.fetch().then((a) => a.size)).toString();

        // If the welcome channel exists and there is a message set in the DB, then send it
        const msg = settings.welcome.leaveMessage
            .replace('{id}', member.user.id)
            .replace('{tag}', member.user.tag)
            .replace('{member}', `<@${member.id}>`)
            .replace('{server}', member.guild.name)
            .replace('{count}', memberCount);

        (welcomeChannel as GuildTextBasedChannel).send(msg);
    }
};
