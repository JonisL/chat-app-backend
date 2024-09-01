// backend/models/Notification.js

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // e.g., 'message', 'conversation'
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // Optional, only for message notifications
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
