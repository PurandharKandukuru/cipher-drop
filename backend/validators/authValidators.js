/**
 * Authentication Validation Schemas
 */
const { z } = require('zod');

/**
 * Registration validation
 */
const registerSchema = z.object({
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * Login validation
 */
const loginSchema = z.object({
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
});

/**
 * Google auth validation
 */
const googleAuthSchema = z.object({
    credential: z.string().min(1, 'Google credential is required'),
});

module.exports = {
    registerSchema,
    loginSchema,
    googleAuthSchema,
};
