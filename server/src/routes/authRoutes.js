const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register and login routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Get current user (requires authentication)
router.get('/me', authController.protect, authController.getCurrentUser);

module.exports = router; 