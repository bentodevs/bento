import mongoose from 'mongoose';

const tags = mongoose.model('tags', new mongoose.Schema({
    guild: String, // The Guild ID
    name: String, // The name of the tag
    content: String, // The content of the tag
    lastModified: Number, // Timestamp the tag was last modified at
}));

export default tags;
