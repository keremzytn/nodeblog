const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
    content: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }, 
    date: { type: Date, default: Date.now },
    post_image: { type: String, required: true },
});

module.exports = mongoose.model('Post', PostSchema);