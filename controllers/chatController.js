const express = require('express');
const router = express.Router();

// Import the necessary functions from the controllers
const { validateRegistration, registerUser } = require('../controllers/userController');
const { sendMessage, createConversation } = require('../controllers/conversationController');

// Check if the imported functions are defined
if (!validateRegistration || !registerUser || !sendMessage || !createConversation) {
    console.error('One or more route handlers are undefined. Please check the imports.');
}

// Define your routes
router.post('/register', validateRegistration, registerUser);
router.post('/send-message', sendMessage); // Example route for sending a message

module.exports = router;
