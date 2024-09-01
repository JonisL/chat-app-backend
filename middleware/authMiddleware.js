const { body, validationResult } = require('express-validator');

// Middleware for login validation
const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 4, max: 20 })
        .withMessage('Username must be between 4 and 20 characters long'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// Middleware for registration validation
const validateRegistration = [
    body('username').isLength({ min: 4, max: 20 }).withMessage('Username must be 4-20 characters long'),
    body('password').isLength({ min: 4, max: 20 })
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[@$!%*?&]/).withMessage('Password must contain a special character'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Token verification logic (e.g., using JWT)
    try {
        req.user = {}; // Add logic to set user after verifying the token
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};


module.exports = {
    authMiddleware,
    validateLogin,
    validateRegistration,
};
