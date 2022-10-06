import { Client, Guild, WebhookClient } from 'discord.js';
import settings from '../database/models/settings';
import { OPS_JOINLEAVE_ID, OPS_JOINLEAVE_SECRET } from '../data/constants.js';

export default async (bot: Client, guild: Guild) => {
    // If there are no guild settings, then create them for the guild
    if (!await settings.findOne({ _id: guild.id })) {
        // eslint-disable-next-line new-cap
        await new settings({ _id: guild.id }).save();
    }

    const webhookClient = new WebhookClient({ id: OPS_JOINLEAVE_ID, token: OPS_JOINLEAVE_SECRET });

    webhookClient.send({
        content: `👋 Joined guild \`${guild.name}\` (\`${guild.id}\`)`,
        username: 'Bento Ops',
        avatarURL: bot.user?.displayAvatarURL(),
    });
};
