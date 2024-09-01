// backend/controllers/conversationController.js
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');





const initialize = (socketIo) => {
    io = socketIo;
};


// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const { participants } = req.body;

        // Check if a conversation with these participants already exists
        let conversation = await Conversation.findOne({ participants: { $all: participants } });

        if (!conversation) {
            conversation = new Conversation({ participants });
            await conversation.save();
        }

        res.status(201).json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Send a message in a conversation
// Send a message in a conversation
const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const sender = req.user.id;

        const message = new Message({
            conversation: conversationId,
            sender,
            content,
        });

        await message.save();

        // Emit the message to all clients in the conversation room
        io.to(conversationId).emit('message', message);

        // Create notifications for all participants except the sender
        const conversation = await Conversation.findById(conversationId).populate('participants');
        const notifications = conversation.participants
            .filter(participant => participant._id.toString() !== sender)
            .map(participant => ({
                user: participant._id,
                type: 'message',
                conversation: conversationId,
                message: message._id,
            }));

        const savedNotifications = await Notification.insertMany(notifications);

        // Emit notifications to the relevant users
        savedNotifications.forEach(notification => {
            io.to(notification.user.toString()).emit('notification', notification);
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all conversations for the logged-in user
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'username profilePhoto')
            .populate('lastMessage');

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        await Message.deleteMany({ conversation: conversationId });
        await Conversation.findByIdAndDelete(conversationId);

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Like or unlike a message
const likeMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if the user has already liked the message
        const hasLiked = message.likes.includes(userId);

        if (hasLiked) {
            // Unlike the message
            message.likes.pull(userId);
        } else {
            // Like the message
            message.likes.push(userId);
        }

        await message.save();

        res.json({
            message: 'Message updated successfully',
            likes: message.likes.length,
            liked: !hasLiked, // Indicate if the user has liked the message or not
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const createGroupConversation = async (req, res) => {
    try {
        const { participants, groupName } = req.body; // Array of user IDs and optional group name

        // Ensure the participants array includes the creator
        if (!participants.includes(req.user.id)) {
            participants.push(req.user.id);
        }

        const conversation = new Conversation({
            participants,
            groupName: groupName || null,
        });

        await conversation.save();

        res.status(201).json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = {
    initialize,
    createGroupConversation,
    likeMessage,
    sendMessage,
    createConversation,
    getConversations,
    deleteConversation,
};