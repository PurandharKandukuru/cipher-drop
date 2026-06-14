/**
 * Share Service - Firebase Version
 * Business logic for share link operations
 */
const ShareLink = require('../models/ShareLink');
const File = require('../models/File');
const AuditService = require('./auditService');
const { AppError } = require('../utils/AppError');
const { bucket } = require('../config/storage');

/**
 * Create a new share link
 */
const createShareLink = async ({ fileId, userId, expiresIn, isOneTime, maxDownloads, req }) => {
    // Verify file exists and user owns it
    const file = await File.findById(fileId);

    if (!file) {
        throw AppError.notFound('File not found');
    }

    if (file.ownerId !== userId) {
        AuditService.logAccessDenied(userId, fileId, { reason: 'not_owner', action: 'create_share_link' }, req);
        throw AppError.forbidden('Not authorized to share this file');
    }

    // Check if file is expired
    if (File.isExpired(file)) {
        throw AppError.fileExpired();
    }

    // Create share link
    const shareLink = await ShareLink.create({
        fileId,
        createdBy: userId,
        expiresIn,
        isOneTime,
        maxDownloads,
    });

    // Audit log
    AuditService.logShareLinkCreate(userId, fileId, shareLink.id, {
        expiresIn,
        isOneTime,
        maxDownloads,
    }, req);

    return shareLink;
};

/**
 * Validate and get share link with file data
 */
const validateShareLink = async ({ token, req }) => {
    const shareLink = await ShareLink.findByToken(token);

    if (!shareLink) {
        throw AppError.shareLinkInvalid();
    }

    if (!ShareLink.isValid(shareLink)) {
        throw AppError.shareLinkInvalid();
    }

    if (ShareLink.isExpired(shareLink)) {
        throw AppError.shareLinkExpired();
    }

    if (!ShareLink.hasDownloadsLeft(shareLink)) {
        throw AppError.downloadLimitReached();
    }

    // Check if file is expired
    if (shareLink.file && File.isExpired(shareLink.file)) {
        throw AppError.fileExpired();
    }

    return shareLink;
};

/**
 * Access shared file metadata
 */
const accessShareLink = async ({ token, req }) => {
    const shareLink = await validateShareLink({ token, req });

    // Audit log
    AuditService.logShareLinkAccess(
        null, // No user ID for public access
        shareLink.fileId,
        shareLink.id,
        { action: 'view_metadata' },
        req
    );

    return shareLink;
};

/**
 * Download file via share link using Firebase Storage
 */
const downloadViaShareLink = async ({ token, req }) => {
    const shareLink = await validateShareLink({ token, req });

    // Get file record from Firestore
    const file = await File.findById(shareLink.fileId);
    if (!file) {
        throw AppError.notFound('File not found in storage');
    }

    // Download from Firebase Storage
    const storageFile = bucket.file(file.storedFilename);
    const [data] = await storageFile.download();

    // Update share link download count
    await ShareLink.incrementDownloadCount(shareLink.id);

    // Deactivate if one-time
    if (shareLink.isOneTime) {
        await ShareLink.deactivate(shareLink.id);
    }

    // Also update file download count
    await File.decrementDownloads(file.id);
    await File.incrementDownloadCount(file.id);

    // Audit log
    AuditService.logShareLinkAccess(
        null,
        shareLink.fileId,
        shareLink.id,
        { action: 'download' },
        req
    );

    return { shareLink, file, data };
};

/**
 * Revoke a share link
 */
const revokeShareLink = async ({ shareLinkId, userId, req }) => {
    const shareLink = await ShareLink.findById(shareLinkId);

    if (!shareLink) {
        throw AppError.notFound('Share link not found');
    }

    // Verify ownership
    if (shareLink.createdBy !== userId) {
        AuditService.logAccessDenied(userId, shareLink.fileId, { reason: 'not_owner', action: 'revoke_share_link' }, req);
        throw AppError.forbidden('Not authorized to revoke this share link');
    }

    await ShareLink.revoke(shareLinkId);

    // Audit log
    AuditService.logShareLinkRevoke(userId, shareLink.fileId, shareLinkId, {}, req);

    return true;
};

/**
 * List share links for a file
 */
const listFileShareLinks = async ({ fileId, userId, req }) => {
    // Verify ownership
    const file = await File.findById(fileId);

    if (!file) {
        throw AppError.notFound('File not found');
    }

    if (file.ownerId !== userId) {
        throw AppError.forbidden('Not authorized');
    }

    return await ShareLink.findByFileId(fileId);
};

/**
 * List all share links for a user
 */
const listUserShareLinks = async (userId) => {
    return await ShareLink.findByUserId(userId);
};

module.exports = {
    createShareLink,
    validateShareLink,
    accessShareLink,
    downloadViaShareLink,
    revokeShareLink,
    listFileShareLinks,
    listUserShareLinks,
};
