/**
 * File Controller - Firebase Version
 * Handles encrypted file operations with Firebase Cloud Storage
 */
const { v4: uuidv4 } = require('uuid');
const sanitizeFilename = require('sanitize-filename');
const { bucket } = require('../config/storage');
const File = require('../models/File');
const { Activity, ActivityType } = require('../models/Activity');

/**
 * Upload an encrypted file to Firebase Cloud Storage
 */
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { originalFilename, encryptedKey, iv, keyIv, salt, hash, expiry, downloadsLimit, isPasswordProtected } = req.body;

        if (!encryptedKey || !iv || !keyIv || !salt || !hash) {
            return res.status(400).json({ success: false, message: 'Missing encryption metadata' });
        }

        // Sanitize the original filename to prevent XSS and path traversal
        const safeFilename = sanitizeFilename(originalFilename || req.file.originalname || 'unnamed_file');

        // Generate unique filename for storage
        const storedFilename = `encrypted-files/${uuidv4()}.enc`;

        // Upload to Firebase Cloud Storage
        try {
            const storageFile = bucket.file(storedFilename);
            await storageFile.save(req.file.buffer, {
                metadata: {
                    contentType: 'application/octet-stream',
                    metadata: {
                        originalFilename: safeFilename,
                        uploadedBy: req.user.id,
                    },
                },
            });
            console.log(`✅ File uploaded to Firebase Storage: ${storedFilename}`);
        } catch (uploadError) {
            console.error('Firebase Storage upload error:', uploadError.message);
            return res.status(500).json({ success: false, message: 'Failed to upload file to storage' });
        }

        let expiryDate = null;
        if (expiry && expiry !== 'never') {
            const days = parseInt(expiry, 10);
            if (!isNaN(days) && days > 0) {
                expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            }
        }

        const file = await File.create({
            ownerId: req.user.id,
            originalFilename: safeFilename,
            storedFilename: storedFilename,
            fileSize: req.file.size,
            encryptedKey,
            iv,
            keyIv,
            salt,
            hash,
            expiry: expiryDate,
            downloadsLeft: downloadsLimit ? parseInt(downloadsLimit, 10) : -1,
            isPasswordProtected: isPasswordProtected === 'true',
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: { fileId: file.id, ...File.toPublicJSON(file) },
        });

        // Log activity (non-blocking)
        Activity.log({
            userId: req.user.id,
            fileId: file.id,
            type: ActivityType.UPLOAD,
            metadata: { filename: file.originalFilename, size: file.fileSize }
        });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
};

/**
 * List all files for authenticated user
 */
const listFiles = async (req, res) => {
    try {
        const files = await File.findByOwnerId(req.user.id);
        res.json({
            success: true,
            data: { files: files.map(File.toPublicJSON), count: files.length },
        });
    } catch (error) {
        console.error('List files error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching files' });
    }
};

/**
 * Get file metadata
 */
const getFileMetadata = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ success: false, message: 'File not found' });
        if (File.isExpired(file)) return res.status(410).json({ success: false, message: 'File has expired' });
        if (!File.hasDownloadsLeft(file)) return res.status(410).json({ success: false, message: 'Download limit reached' });

        // Track share link access
        await File.incrementShareCount(file.id);

        res.json({ success: true, data: File.toDownloadJSON(file) });
    } catch (error) {
        console.error('Get file metadata error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching file' });
    }
};

/**
 * Download encrypted file from Firebase Cloud Storage
 */
const downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ success: false, message: 'File not found' });
        if (File.isExpired(file)) return res.status(410).json({ success: false, message: 'File has expired' });
        if (!File.hasDownloadsLeft(file)) return res.status(410).json({ success: false, message: 'Download limit reached' });

        // Download from Firebase Cloud Storage
        let data;
        try {
            const storageFile = bucket.file(file.storedFilename);
            const [buffer] = await storageFile.download();
            data = buffer;
        } catch (downloadError) {
            console.error('Firebase Storage download error:', downloadError.message);
            return res.status(404).json({ success: false, message: 'File not found in storage' });
        }

        await File.decrementDownloads(file.id);
        await File.incrementDownloadCount(file.id);

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', file.fileSize);
        res.setHeader('Content-Disposition', `attachment; filename="encrypted_${file.originalFilename}"`);

        res.send(data);

        // Log download activity (non-blocking)
        Activity.log({
            userId: file.ownerId,
            fileId: file.id,
            type: ActivityType.DOWNLOAD,
            metadata: { filename: file.originalFilename }
        });
    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during download' });
    }
};

/**
 * Delete a file from Firebase Cloud Storage
 */
const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ success: false, message: 'File not found' });
        if (file.ownerId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        // Delete from Firebase Cloud Storage
        try {
            const storageFile = bucket.file(file.storedFilename);
            await storageFile.delete();
            console.log(`🗑️ File deleted from Firebase Storage: ${file.storedFilename}`);
        } catch (storageError) {
            console.error('Firebase Storage delete error:', storageError.message);
            // Continue to delete from database even if storage delete fails
        }

        await File.deleteById(file.id);
        res.json({ success: true, message: 'File deleted successfully' });

        // Log delete activity (non-blocking)
        Activity.log({
            userId: req.user.id,
            fileId: file.id,
            type: ActivityType.DELETE,
            metadata: { filename: file.originalFilename }
        });
    } catch (error) {
        console.error('Delete error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during deletion' });
    }
};

/**
 * Get aggregate stats for current user
 */
const getStats = async (req, res) => {
    try {
        const stats = await File.getStatsByOwnerId(req.user.id);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Stats error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching stats' });
    }
};

/**
 * Get weekly upload/download activity for charts
 */
const getWeeklyActivity = async (req, res) => {
    try {
        const weeklyData = await Activity.getWeeklyStats(req.user.id);
        res.json({
            success: true,
            data: weeklyData
        });
    } catch (error) {
        console.error('Weekly activity error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching weekly activity' });
    }
};

module.exports = { uploadFile, listFiles, getFileMetadata, downloadFile, deleteFile, getStats, getWeeklyActivity };
