const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 20
    },
    profilePhoto: {
        type: String,
        default: 'default-photo-url',
    },
    // Additional fields
});

// Hash the password before saving the user
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
