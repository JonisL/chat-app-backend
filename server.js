const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const mainRouter = require('./routes/mainRouter');
const conversationController = require('./controllers/conversationController');
require('dotenv').config();  // Load environment variables from .env file

const app = express();

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,  // If using indexes
    useFindAndModify: false // If using findAndModify
}).then(() => console.log('Connected to MongoDB')).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Create server instance
const server = http.createServer(app);

// Initialize Socket.IO with server and configure CORS
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

// Initialize controllers with the `io` instance
conversationController.initialize(io);

app.use(express.json());

// Mount routes
app.use('/api', mainRouter);

// Example route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', ({ conversationId }) => {
        socket.join(conversationId);
    });

    socket.on('sendMessage', ({ conversationId, message }) => {
        io.to(conversationId).emit('message', message);
    });

    socket.on('updateProfile', (profile) => {
        io.emit('profileUpdated', profile); // Broadcast profile updates to all users
    });

    socket.on('deleteConversation', ({ conversationId }) => {
        io.emit('conversationDeleted', conversationId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
server.listen(5000, () => console.log('Server running on port 5000'));
