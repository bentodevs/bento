import { model, Schema } from 'mongoose';
import { IPunishments } from '../../modules/interfaces/db';

const punishmentSchema = new Schema<IPunishments>({
    id: { type: Number, required: true },
    guildId: { type: String, required: true },
    type: { type: String, required: true },
    userId: { type: String, required: true },
    executorId: { type: String, required: true },
    actionTime: { type: Number, required: true },
    reason: { type: String, required: true },
    muteTime: { type: Number, required: false },
});

const punishments = model<IPunishments>('punishments', punishmentSchema);

export default punishments;
