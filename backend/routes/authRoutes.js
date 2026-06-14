/**
 * Authentication Routes - Firebase Version
 * Handles Firebase token authentication and profile
 */
const express = require('express');
const router = express.Router();

const { firebaseAuth, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/firebase
 * @desc    Authenticate with Firebase ID token
 * @access  Public
 */
router.post('/firebase', authLimiter, firebaseAuth);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, getMe);

module.exports = router;
