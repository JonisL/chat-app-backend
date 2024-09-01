// backend/models/Conversation.js

const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // Reference to the last message
    groupName: { type: String }, // Optional: Name of the group
    createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;
