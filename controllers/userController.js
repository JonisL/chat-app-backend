const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import JWT for authentication
const User = require('../models/User');
const { io } = require('../server'); // Import socket.io for real-time updates

// Register a New User
const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Profile Photo
const updateUserPhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profilePhoto } = req.body;

        const user = await User.findByIdAndUpdate(userId, { profilePhoto }, { new: true }).select('-password');

        res.json({
            message: 'Profile photo updated successfully',
            user: {
                id: user._id,
                username: user.username,
                profilePhoto: user.profilePhoto,
            }
        });
    } catch (error) {
        console.error('Error updating profile photo:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Username
const updateUsername = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username } = req.body;

        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const user = await User.findByIdAndUpdate(userId, { username }, { new: true }).select('-password');

        res.json({
            message: 'Username updated successfully',
            user: {
                id: user._id,
                username: user.username,
                profilePhoto: user.profilePhoto,
            }
        });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Password
const updateUserPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        // Fetch the user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        // Hash the new password and update it
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('username profilePhoto');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch a User by Username
const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('username profilePhoto');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user by username:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update User Profile (both photo and username)
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profilePhoto, username } = req.body;

        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const user = await User.findByIdAndUpdate(userId, { profilePhoto, username }, { new: true }).select('-password');

        // Emit the profile update to all connected clients
        io.emit('profileUpdated', user);

        res.json(user);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserPhoto,
    updateUsername,
    updateUserPassword,
    getAllUsers,
    getUserByUsername,
};
