/**
 * Share Link Controller
 * Handles share link HTTP endpoints
 */
const ShareLink = require('../models/ShareLink');
const File = require('../models/File');
const shareService = require('../services/shareService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a new share link
 * POST /api/shares
 */
const createShareLink = asyncHandler(async (req, res) => {
    const { fileId, expiresIn, isOneTime, maxDownloads } = req.body;

    const shareLink = await shareService.createShareLink({
        fileId,
        userId: req.user.id,
        expiresIn,
        isOneTime,
        maxDownloads,
        req,
    });

    res.status(201).json({
        success: true,
        message: 'Share link created',
        data: ShareLink.toPublicJSON(shareLink),
    });
});

/**
 * Get share link metadata (public)
 * GET /api/shares/:token
 */
const getShareLinkMetadata = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const shareLink = await shareService.accessShareLink({ token, req });

    res.json({
        success: true,
        data: {
            ...ShareLink.toPublicJSON(shareLink),
            file: File.toDownloadJSON(shareLink.file),
        },
    });
});

/**
 * Download file via share link (public)
 * GET /api/shares/:token/download
 */
const downloadViaShareLink = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const { file, data } = await shareService.downloadViaShareLink({ token, req });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', file.fileSize);
    res.setHeader('Content-Disposition', `attachment; filename="encrypted_${file.originalFilename}"`);

    res.send(data);
});

/**
 * Revoke a share link
 * DELETE /api/shares/:id
 */
const revokeShareLink = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await shareService.revokeShareLink({
        shareLinkId: id,
        userId: req.user.id,
        req,
    });

    res.json({
        success: true,
        message: 'Share link revoked',
    });
});

/**
 * List share links for a file
 * GET /api/shares/file/:fileId
 */
const listFileShareLinks = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    const shareLinks = await shareService.listFileShareLinks({
        fileId,
        userId: req.user.id,
        req,
    });

    res.json({
        success: true,
        data: {
            shareLinks: shareLinks.map(ShareLink.toPublicJSON),
            count: shareLinks.length,
        },
    });
});

/**
 * List all share links for current user
 * GET /api/shares
 */
const listUserShareLinks = asyncHandler(async (req, res) => {
    const shareLinks = await shareService.listUserShareLinks(req.user.id);

    res.json({
        success: true,
        data: {
            shareLinks: shareLinks.map(ShareLink.toPublicJSON),
            count: shareLinks.length,
        },
    });
});

module.exports = {
    createShareLink,
    getShareLinkMetadata,
    downloadViaShareLink,
    revokeShareLink,
    listFileShareLinks,
    listUserShareLinks,
};
