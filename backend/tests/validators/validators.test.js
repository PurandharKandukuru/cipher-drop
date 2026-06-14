/**
 * Validators Unit Tests
 */
const { z } = require('zod');
const { validateBody, validateParams, validateQuery } = require('../../validators');
const {
    uploadMetadataSchema,
    fileIdSchema,
    createShareLinkSchema
} = require('../../validators/fileValidators');
const {
    registerSchema,
    loginSchema
} = require('../../validators/authValidators');

describe('Validation Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = { body: {}, params: {}, query: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    describe('validateBody', () => {
        const testSchema = z.object({
            name: z.string().min(1),
            age: z.number().int().positive(),
        });

        it('should pass valid body to next()', () => {
            mockReq.body = { name: 'John', age: 25 };

            validateBody(testSchema)(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
        });

        it('should call next with error for invalid body', () => {
            mockReq.body = { name: '', age: -1 };

            validateBody(testSchema)(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
        });
    });
});

describe('File Validators', () => {
    describe('fileIdSchema', () => {
        it('should accept valid UUID', () => {
            const result = fileIdSchema.safeParse({
                id: '123e4567-e89b-12d3-a456-426614174000'
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid UUID', () => {
            const result = fileIdSchema.safeParse({ id: 'invalid-id' });
            expect(result.success).toBe(false);
        });
    });

    describe('createShareLinkSchema', () => {
        it('should accept valid share link data', () => {
            const result = createShareLinkSchema.safeParse({
                fileId: '123e4567-e89b-12d3-a456-426614174000',
                expiresIn: 7,
                isOneTime: true,
                maxDownloads: 5,
            });
            expect(result.success).toBe(true);
        });

        it('should reject expiry > 30 days', () => {
            const result = createShareLinkSchema.safeParse({
                fileId: '123e4567-e89b-12d3-a456-426614174000',
                expiresIn: 31,
            });
            expect(result.success).toBe(false);
        });

        it('should use defaults for optional fields', () => {
            const result = createShareLinkSchema.safeParse({
                fileId: '123e4567-e89b-12d3-a456-426614174000',
            });
            expect(result.success).toBe(true);
            expect(result.data.isOneTime).toBe(false);
            expect(result.data.maxDownloads).toBe(-1);
        });
    });
});

describe('Auth Validators', () => {
    describe('registerSchema', () => {
        it('should accept valid registration', () => {
            const result = registerSchema.safeParse({
                email: 'test@example.com',
                password: 'Password123',
            });
            expect(result.success).toBe(true);
            expect(result.data.email).toBe('test@example.com');
        });

        it('should reject weak password', () => {
            const result = registerSchema.safeParse({
                email: 'test@example.com',
                password: 'weak',
            });
            expect(result.success).toBe(false);
        });

        it('should reject password without number', () => {
            const result = registerSchema.safeParse({
                email: 'test@example.com',
                password: 'NoNumberHere',
            });
            expect(result.success).toBe(false);
        });

        it('should normalize email to lowercase', () => {
            const result = registerSchema.safeParse({
                email: 'TEST@EXAMPLE.COM',
                password: 'Password123',
            });
            expect(result.success).toBe(true);
            expect(result.data.email).toBe('test@example.com');
        });
    });

    describe('loginSchema', () => {
        it('should accept valid login', () => {
            const result = loginSchema.safeParse({
                email: 'test@example.com',
                password: 'anypassword',
            });
            expect(result.success).toBe(true);
        });

        it('should reject empty password', () => {
            const result = loginSchema.safeParse({
                email: 'test@example.com',
                password: '',
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid email', () => {
            const result = loginSchema.safeParse({
                email: 'invalid-email',
                password: 'password123',
            });
            expect(result.success).toBe(false);
        });
    });
});
