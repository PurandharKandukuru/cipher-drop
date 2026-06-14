/**
 * Share Link Routes
 * Handles share link endpoints with validation
 */
const express = require('express');
const router = express.Router();

const {
    createShareLink,
    getShareLinkMetadata,
    downloadViaShareLink,
    revokeShareLink,
    listFileShareLinks,
    listUserShareLinks,
} = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');
const { downloadLimiter } = require('../middleware/rateLimiter');
const { validateBody, validateParams } = require('../validators');
const { createShareLinkSchema, shareLinkTokenSchema } = require('../validators/fileValidators');
const { z } = require('zod');

/**
 * @route   POST /api/shares
 * @desc    Create a new share link
 * @access  Private
 */
router.post(
    '/',
    protect,
    validateBody(createShareLinkSchema),
    createShareLink
);

/**
 * @route   GET /api/shares
 * @desc    List all share links for current user
 * @access  Private
 */
router.get('/', protect, listUserShareLinks);

/**
 * @route   GET /api/shares/file/:fileId
 * @desc    List share links for a specific file
 * @access  Private
 */
router.get(
    '/file/:fileId',
    protect,
    validateParams(z.object({ fileId: z.string().uuid() })),
    listFileShareLinks
);

/**
 * @route   GET /api/shares/:token
 * @desc    Get shared file metadata (public)
 * @access  Public
 */
router.get(
    '/:token',
    downloadLimiter,
    validateParams(shareLinkTokenSchema),
    getShareLinkMetadata
);

/**
 * @route   GET /api/shares/:token/download
 * @desc    Download file via share link (public)
 * @access  Public
 */
router.get(
    '/:token/download',
    downloadLimiter,
    validateParams(shareLinkTokenSchema),
    downloadViaShareLink
);

/**
 * @route   DELETE /api/shares/:id
 * @desc    Revoke a share link
 * @access  Private (owner only)
 */
router.delete(
    '/:id',
    protect,
    validateParams(z.object({ id: z.string().uuid() })),
    revokeShareLink
);

module.exports = router;
