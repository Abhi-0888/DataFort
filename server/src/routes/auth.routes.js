const express = require('express');
const router = express.Router();
const { authRateLimiter } = require('../middleware/rateLimiter');
const {
    register,
    login,
    logout,
    getMe,
    refreshToken,
} = require('../controllers/auth.controller');
const { authGuard } = require('../middleware/authGuard');

// Public routes (rate-limited tightly)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', authRateLimiter, refreshToken);

// Protected routes
router.post('/logout', authGuard, logout);
router.get('/me', authGuard, getMe);

module.exports = router;
