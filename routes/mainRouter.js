const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    updateUserPhoto,
    updateUsername,
    updateUserPassword,
    getAllUsers,
    getUserByUsername,
} = require('../controllers/userController');

const {
    createConversation,
    sendMessage,
    getConversations,
    deleteConversation,
    createGroupConversation,
    likeMessage,
} = require('../controllers/conversationController');

const { validateLogin,
    validateRegistration } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const chatRouter = require('./chatRouter');

// Routes
router.post('/register', [...validateRegistration, registerUser]);
router.post('/login', validateLogin, loginUser);
router.put('/profile/photo', authMiddleware, updateUserPhoto);




router.use('/chat', authMiddleware, chatRouter); // Protect chat routes with auth middleware


router.get('/users', authMiddleware, getAllUsers);
router.get('/user/:username', authMiddleware, getUserByUsername);

router.put('/profile/photo', authMiddleware, updateUserPhoto);
router.put('/profile/username', authMiddleware, updateUsername);
router.put('/profile/password', authMiddleware, updateUserPassword);

router.post('/conversations', authMiddleware, createConversation);
router.post('/conversations/message', authMiddleware, sendMessage);
router.get('/conversations', authMiddleware, getConversations);
router.delete('/conversations/:conversationId', authMiddleware, deleteConversation);
router.post('/conversations/group', authMiddleware, createGroupConversation);
router.put('/message/:messageId/like', authMiddleware, likeMessage);

// Fetch all notifications for the logged-in user
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id, read: false })
            .populate('conversation')
            .populate('message')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Mark a notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
