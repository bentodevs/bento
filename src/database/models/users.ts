import mongoose from 'mongoose';
import { IUsers } from '../../modules/interfaces/db';

const users = mongoose.model<IUsers>('users', new mongoose.Schema({
    _id: String, // The user ID
    accounts: {
        lastfm: String,
    },
}));

export default users;
