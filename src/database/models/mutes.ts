import { model, Schema } from 'mongoose';
import { IMutes } from '../../modules/interfaces/db';

const muteSchema = new Schema<IMutes>({
    guildId: { type: String, required: true },
    mutedId: { type: String, required: true },
    timestamps: {
        start: { type: Number, required: true },
        length: { type: Number, required: true },
    },
    reason: { type: String, required: true },
    caseId: { type: Number, required: true },
});

const mutes = model<IMutes>('mutes', muteSchema);

export default mutes;
