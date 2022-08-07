import mongoose, { Schema } from 'mongoose';
import { IPremiumGuild } from '../../modules/interfaces/db';

const premiumSchema = new Schema<IPremiumGuild>({
    paypalId: { type: String, required: true },
    discordId: { type: String, required: true },
    guilds: [{ type: String, required: true }],
    expiry: { type: Number, required: true },
});

const premiumGuild = mongoose.model<IPremiumGuild>('premiumGuild', premiumSchema);

export default premiumGuild;
