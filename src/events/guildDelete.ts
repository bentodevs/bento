import { Client, Guild, WebhookClient } from 'discord.js';
import { OPS_JOINLEAVE_ID, OPS_JOINLEAVE_SECRET } from '../data/constants';

export default async (bot: Client, guild: Guild) => {
    // If the guild is not available, then return
    // This typically indicates that there is a server outage
    if (!guild.available) return;

    const webhookClient = new WebhookClient({ id: OPS_JOINLEAVE_ID, token: OPS_JOINLEAVE_SECRET });

    webhookClient.send({
        content: `🍃 Left guild \`${guild.name}\` (\`${guild.id}\`)`,
        username: 'Bento Ops',
        avatarURL: bot.user?.displayAvatarURL(),
    });
};
