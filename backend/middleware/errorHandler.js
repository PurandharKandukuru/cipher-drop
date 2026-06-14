/**
 * Centralized Error Handler Middleware
 * Provides consistent error responses and logging
 */
const { AppError, ErrorCodes } = require('../utils/AppError');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let code = err.code || ErrorCodes.INTERNAL_ERROR;
    let message = err.message || 'Internal server error';

    // Log error with request context
    const errorLog = {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode,
        code,
        message,
        userId: req.user?.id,
        ip: req.ip,
        timestamp: new Date().toISOString(),
    };

    // Only log stack trace in development for non-operational errors
    if (process.env.NODE_ENV === 'development' || !err.isOperational) {
        errorLog.stack = err.stack;
    }

    console.error('❌ Error:', JSON.stringify(errorLog, null, 2));

    // Handle specific error types
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        code = ErrorCodes.VALIDATION_ERROR;
        message = 'File size exceeds limit';
    }

    if (err.message === 'Not allowed by CORS') {
        statusCode = 403;
        code = ErrorCodes.FORBIDDEN;
        message = 'CORS error';
    }

    // Zod validation errors
    if (err.name === 'ZodError') {
        statusCode = 400;
        code = ErrorCodes.VALIDATION_ERROR;
        message = err.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = ErrorCodes.UNAUTHORIZED;
        message = 'Invalid or expired token';
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        code,
        message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : message,
        requestId: req.requestId,
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
    next(AppError.notFound(`Endpoint not found: ${req.method} ${req.path}`));
};

module.exports = { errorHandler, asyncHandler, notFoundHandler };
