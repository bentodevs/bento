import { model, Schema } from 'mongoose';
import { IGiveaways } from '../../modules/interfaces/db';

const giveawaySchema = new Schema<IGiveaways>({
    id: { type: Number, required: true },
    guild: {
        guildId: { type: String, required: true },
        channelId: { type: String, required: true },
        messageId: { type: String, required: true },
    },
    creator: { type: String, required: true },
    winners: { type: Number, required: true },
    prize: { type: String, required: true },
    entries: [{ type: String, required: true }],
    timestamps: {
        start: { type: String, required: true },
        end: { type: String, required: true },
        length: { type: Number, required: true },
    },
    active: Boolean,
});

const giveaways = model<IGiveaways>('giveaways', giveawaySchema);

export default giveaways;
