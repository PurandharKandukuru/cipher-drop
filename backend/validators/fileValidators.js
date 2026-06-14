/**
 * File-related Validation Schemas
 */
const { z } = require('zod');

/**
 * File upload metadata validation
 */
const uploadMetadataSchema = z.object({
    originalFilename: z.string().min(1).max(255),
    encryptedKey: z.string().min(1),
    iv: z.string().min(1),
    keyIv: z.string().min(1),
    salt: z.string().min(1),
    hash: z.string().length(64, 'Hash must be SHA-256 hex string'),
    expiry: z.string().optional(),
    downloadsLimit: z.string().optional(),
    isPasswordProtected: z.enum(['true', 'false']).optional(),
});

/**
 * File ID parameter validation
 */
const fileIdSchema = z.object({
    id: z.string().uuid('Invalid file ID format'),
});

/**
 * Share link creation validation
 */
const createShareLinkSchema = z.object({
    fileId: z.string().uuid('Invalid file ID'),
    expiresIn: z.number().int().min(1).max(30).optional(), // Days until expiry
    isOneTime: z.boolean().default(false),
    maxDownloads: z.number().int().min(1).max(1000).default(-1), // -1 = unlimited
});

/**
 * Share link token validation
 */
const shareLinkTokenSchema = z.object({
    token: z.string().length(32, 'Invalid share link token'),
});

module.exports = {
    uploadMetadataSchema,
    fileIdSchema,
    createShareLinkSchema,
    shareLinkTokenSchema,
};
