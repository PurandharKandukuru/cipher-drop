/**
 * Request ID Generator
 * Generates unique request IDs for audit trail tracking
 */
const crypto = require('crypto');

/**
 * Generate a unique request ID
 * Format: timestamp-randomhex (e.g., 1703750400000-a1b2c3d4)
 */
const generateRequestId = () => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
};

/**
 * Middleware to attach request ID to each request
 */
const requestIdMiddleware = (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || generateRequestId();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};

module.exports = { generateRequestId, requestIdMiddleware };
