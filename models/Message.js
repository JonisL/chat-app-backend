// backend/models/Message.js

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked the message
    createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
