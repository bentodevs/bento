import { Snowflake } from 'discord.js';
import { model, Schema } from 'mongoose';
import { IReactRoles } from '../../modules/interfaces/db';

const reactRoleSchema = new Schema<IReactRoles>({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    roleIds: [{ type: Object, required: true }],
});

const reactRoles = model<IReactRoles>('reactroles', reactRoleSchema);

export default reactRoles;
