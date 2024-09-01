const express = require('express');
const router = express.Router();

const {
    createGroupConversation,
    likeMessage,
    sendMessage,
    createConversation,
    getConversations,
    deleteConversation,
} = require('../controllers/conversationController');

const { authMiddleware } = require('../middleware/authMiddleware');

// Debugging: Ensure that all imported handlers are not undefined
console.log({ createConversation, sendMessage, authMiddleware });
console.log('authMiddleware:', authMiddleware);

router.post('/create-conversation', authMiddleware, createConversation);
router.post('/send-message', authMiddleware, sendMessage);
router.get('/conversations', authMiddleware, getConversations);
router.delete('/conversations/:conversationId', authMiddleware, deleteConversation);
router.post('/conversations/group', authMiddleware, createGroupConversation);
router.put('/message/:messageId/like', authMiddleware, likeMessage);


module.exports = router;
