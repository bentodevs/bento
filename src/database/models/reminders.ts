import { model, Schema } from 'mongoose';
import { IReminders } from '../../modules/interfaces/db';

const reminderSchema = new Schema<IReminders>({
    _id: { type: String, required: true },
    reminders: [{ type: Object, required: true }],
});

const reminders = model<IReminders>('reminders', reminderSchema);

export default reminders;
