import { model, Schema } from 'mongoose';
import { IPrebans } from '../../modules/interfaces/db';

const prebanSchema = new Schema<IPrebans>({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    reason: { type: String, required: true },
    executor: { type: String, required: true },
});

const preban = model<IPrebans>('preban', prebanSchema);

export default preban;
