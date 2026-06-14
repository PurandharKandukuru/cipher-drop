/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting request frequency
 */
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Applies to all routes
 */
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development (optional)
    skip: () => process.env.NODE_ENV === 'development',
});

/**
 * Stricter limiter for authentication endpoints
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again in 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Stricter limiter for file uploads
 * Prevents storage abuse
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: {
        success: false,
        message: 'Upload limit reached, please try again in an hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Download rate limiter
 * Prevents bandwidth abuse
 */
const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 downloads per window
    message: {
        success: false,
        message: 'Download limit reached, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    downloadLimiter,
};
