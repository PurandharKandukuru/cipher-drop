/**
 * AppError Unit Tests
 */
const { AppError, ErrorCodes } = require('../../utils/AppError');

describe('AppError', () => {
    describe('constructor', () => {
        it('should create an error with default values', () => {
            const error = new AppError('Test error');

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe(ErrorCodes.INTERNAL_ERROR);
            expect(error.isOperational).toBe(true);
        });

        it('should create an error with custom values', () => {
            const error = new AppError('Custom error', 400, ErrorCodes.VALIDATION_ERROR);

            expect(error.message).toBe('Custom error');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        });

        it('should capture stack trace', () => {
            const error = new AppError('Stack test');

            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('AppError');
        });
    });

    describe('static factory methods', () => {
        it('should create badRequest error', () => {
            const error = AppError.badRequest('Invalid input');

            expect(error.statusCode).toBe(400);
            expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
            expect(error.message).toBe('Invalid input');
        });

        it('should create unauthorized error', () => {
            const error = AppError.unauthorized();

            expect(error.statusCode).toBe(401);
            expect(error.code).toBe(ErrorCodes.UNAUTHORIZED);
            expect(error.message).toBe('Not authorized');
        });

        it('should create forbidden error', () => {
            const error = AppError.forbidden('Access denied');

            expect(error.statusCode).toBe(403);
            expect(error.code).toBe(ErrorCodes.FORBIDDEN);
        });

        it('should create notFound error', () => {
            const error = AppError.notFound('File not found');

            expect(error.statusCode).toBe(404);
            expect(error.code).toBe(ErrorCodes.NOT_FOUND);
        });

        it('should create fileExpired error', () => {
            const error = AppError.fileExpired();

            expect(error.statusCode).toBe(410);
            expect(error.code).toBe(ErrorCodes.FILE_EXPIRED);
        });

        it('should create downloadLimitReached error', () => {
            const error = AppError.downloadLimitReached();

            expect(error.statusCode).toBe(410);
            expect(error.code).toBe(ErrorCodes.DOWNLOAD_LIMIT_REACHED);
        });

        it('should create shareLinkInvalid error', () => {
            const error = AppError.shareLinkInvalid();

            expect(error.statusCode).toBe(404);
            expect(error.code).toBe(ErrorCodes.SHARE_LINK_INVALID);
        });

        it('should create shareLinkExpired error', () => {
            const error = AppError.shareLinkExpired();

            expect(error.statusCode).toBe(410);
            expect(error.code).toBe(ErrorCodes.SHARE_LINK_EXPIRED);
        });
    });

    describe('ErrorCodes', () => {
        it('should have all required error codes', () => {
            expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
            expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
            expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
            expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
            expect(ErrorCodes.FILE_EXPIRED).toBe('FILE_EXPIRED');
            expect(ErrorCodes.DOWNLOAD_LIMIT_REACHED).toBe('DOWNLOAD_LIMIT_REACHED');
            expect(ErrorCodes.SHARE_LINK_INVALID).toBe('SHARE_LINK_INVALID');
            expect(ErrorCodes.SHARE_LINK_EXPIRED).toBe('SHARE_LINK_EXPIRED');
            expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
        });
    });
});
