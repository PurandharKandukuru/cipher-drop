/**
 * File Service - Firebase Version
 * Business logic for file operations using Firebase Cloud Storage
 */
const { v4: uuidv4 } = require('uuid');
const sanitizeFilename = require('sanitize-filename');
const { bucket } = require('../config/storage');
const File = require('../models/File');
const AuditService = require('./auditService');
const { AppError } = require('../utils/AppError');

/**
 * Upload encrypted file to Firebase Cloud Storage
 */
const uploadFile = async ({ file, metadata, userId, req }) => {
    // Sanitize filename
    const safeFilename = sanitizeFilename(metadata.originalFilename || file.originalname || 'unnamed_file');
    const storedFilename = `encrypted-files/${uuidv4()}.enc`;

    // Upload to Firebase Storage
    const storageFile = bucket.file(storedFilename);
    await storageFile.save(file.buffer, {
        metadata: {
            contentType: 'application/octet-stream',
            metadata: {
                originalFilename: safeFilename,
                uploadedBy: userId,
            },
        },
    });

    console.log(`✅ File uploaded to Firebase Storage: ${storedFilename}`);

    // Parse expiry
    let expiryDate = null;
    if (metadata.expiry && metadata.expiry !== 'never') {
        const days = parseInt(metadata.expiry, 10);
        if (!isNaN(days) && days > 0) {
            expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        }
    }

    // Create file record in Firestore
    const fileRecord = await File.create({
        ownerId: userId,
        originalFilename: safeFilename,
        storedFilename,
        fileSize: file.size,
        encryptedKey: metadata.encryptedKey,
        iv: metadata.iv,
        keyIv: metadata.keyIv,
        salt: metadata.salt,
        hash: metadata.hash,
        expiry: expiryDate,
        downloadsLeft: metadata.downloadsLimit ? parseInt(metadata.downloadsLimit, 10) : -1,
        isPasswordProtected: metadata.isPasswordProtected === 'true',
    });

    // Audit log
    AuditService.logFileUpload(userId, fileRecord.id, {
        filename: safeFilename,
        size: file.size,
    }, req);

    return fileRecord;
};

/**
 * Get file for download from Firebase Storage
 */
const getFileForDownload = async ({ fileId, userId, req }) => {
    const file = await File.findById(fileId);

    if (!file) {
        throw AppError.notFound('File not found');
    }

    if (File.isExpired(file)) {
        AuditService.logAccessDenied(userId, fileId, { reason: 'expired' }, req);
        throw AppError.fileExpired();
    }

    if (!File.hasDownloadsLeft(file)) {
        AuditService.logAccessDenied(userId, fileId, { reason: 'download_limit' }, req);
        throw AppError.downloadLimitReached();
    }

    // Download from Firebase Storage
    const storageFile = bucket.file(file.storedFilename);
    const [data] = await storageFile.download();

    // Update download counts
    await File.decrementDownloads(file.id);
    await File.incrementDownloadCount(file.id);

    // Audit log
    AuditService.logFileDownload(userId || file.ownerId, fileId, {
        filename: file.originalFilename,
    }, req);

    return { file, data };
};

/**
 * Delete file from Firebase Storage
 */
const deleteFile = async ({ fileId, userId, req }) => {
    const file = await File.findById(fileId);

    if (!file) {
        throw AppError.notFound('File not found');
    }

    if (file.ownerId !== userId) {
        AuditService.logAccessDenied(userId, fileId, { reason: 'not_owner' }, req);
        throw AppError.forbidden('Not authorized to delete this file');
    }

    // Delete from Firebase Storage
    try {
        const storageFile = bucket.file(file.storedFilename);
        await storageFile.delete();
        console.log(`🗑️ File deleted from Firebase Storage: ${file.storedFilename}`);
    } catch (err) {
        console.error('Firebase Storage delete error:', err.message);
        // Continue to delete from DB even if storage delete fails
    }

    await File.deleteById(file.id);

    // Audit log
    AuditService.logFileDelete(userId, fileId, {
        filename: file.originalFilename,
    }, req);

    return true;
};

/**
 * Get file metadata for download preparation
 */
const getFileMetadata = async ({ fileId, userId, req }) => {
    const file = await File.findById(fileId);

    if (!file) {
        throw AppError.notFound('File not found');
    }

    if (File.isExpired(file)) {
        throw AppError.fileExpired();
    }

    if (!File.hasDownloadsLeft(file)) {
        throw AppError.downloadLimitReached();
    }

    // Track share link access
    await File.incrementShareCount(file.id);

    // Audit log
    AuditService.logFileView(userId, fileId, {
        filename: file.originalFilename,
    }, req);

    return file;
};

/**
 * List files for user
 */
const listUserFiles = async (userId) => {
    return await File.findByOwnerId(userId);
};

/**
 * Get user file stats
 */
const getUserStats = async (userId) => {
    return await File.getStatsByOwnerId(userId);
};

module.exports = {
    uploadFile,
    getFileForDownload,
    deleteFile,
    getFileMetadata,
    listUserFiles,
    getUserStats,
};
