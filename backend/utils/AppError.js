/**
 * Custom Application Error Class
 * Provides consistent error structure across the application
 */

const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    FILE_EXPIRED: 'FILE_EXPIRED',
    DOWNLOAD_LIMIT_REACHED: 'DOWNLOAD_LIMIT_REACHED',
    SHARE_LINK_INVALID: 'SHARE_LINK_INVALID',
    SHARE_LINK_EXPIRED: 'SHARE_LINK_EXPIRED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};

class AppError extends Error {
    constructor(message, statusCode = 500, code = ErrorCodes.INTERNAL_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, code = ErrorCodes.VALIDATION_ERROR) {
        return new AppError(message, 400, code);
    }

    static unauthorized(message = 'Not authorized') {
        return new AppError(message, 401, ErrorCodes.UNAUTHORIZED);
    }

    static forbidden(message = 'Access denied') {
        return new AppError(message, 403, ErrorCodes.FORBIDDEN);
    }

    static notFound(message = 'Resource not found') {
        return new AppError(message, 404, ErrorCodes.NOT_FOUND);
    }

    static fileExpired() {
        return new AppError('File has expired', 410, ErrorCodes.FILE_EXPIRED);
    }

    static downloadLimitReached() {
        return new AppError('Download limit reached', 410, ErrorCodes.DOWNLOAD_LIMIT_REACHED);
    }

    static shareLinkInvalid() {
        return new AppError('Share link is invalid or has been revoked', 404, ErrorCodes.SHARE_LINK_INVALID);
    }

    static shareLinkExpired() {
        return new AppError('Share link has expired', 410, ErrorCodes.SHARE_LINK_EXPIRED);
    }
}

module.exports = { AppError, ErrorCodes };
