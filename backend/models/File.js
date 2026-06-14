/**
 * File Model - Firebase Firestore Version
 * Handles encrypted file metadata operations with Firestore
 */
const { db, admin } = require('../config/db');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION = 'files';

const File = {
    /**
     * Create a new file record
     */
    async create(fileData) {
        const docRef = db.collection(COLLECTION).doc();
        const data = {
            id: docRef.id,
            owner_id: fileData.ownerId,
            original_filename: fileData.originalFilename,
            stored_filename: fileData.storedFilename,
            file_size: fileData.fileSize,
            encrypted_key: fileData.encryptedKey,
            iv: fileData.iv,
            key_iv: fileData.keyIv,
            salt: fileData.salt,
            hash: fileData.hash,
            expiry: fileData.expiry || null,
            downloads_left: fileData.downloadsLeft ?? -1,
            download_count: 0,
            share_count: 0,
            is_password_protected: fileData.isPasswordProtected || false,
            created_at: new Date().toISOString(),
        };

        await docRef.set(data);
        return File.formatFile(data);
    },

    /**
     * Find file by ID
     */
    async findById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return File.formatFile({ id: doc.id, ...doc.data() });
    },

    /**
     * Find all files by owner ID
     */
    async findByOwnerId(ownerId) {
        // Single-field equality only (no composite index needed); sort in memory.
        const snapshot = await db.collection(COLLECTION)
            .where('owner_id', '==', ownerId)
            .get();

        return snapshot.docs
            .map(doc => File.formatFile({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    /**
     * Delete file by ID
     */
    async deleteById(id) {
        await db.collection(COLLECTION).doc(id).delete();
        return true;
    },

    /**
     * Decrement downloads count
     */
    async decrementDownloads(id) {
        const file = await File.findById(id);
        if (file && file.downloadsLeft > 0) {
            await db.collection(COLLECTION).doc(id).update({
                downloads_left: FieldValue.increment(-1),
            });
        }
    },

    /**
     * Increment download count (for stats tracking)
     */
    async incrementDownloadCount(id) {
        try {
            await db.collection(COLLECTION).doc(id).update({
                download_count: FieldValue.increment(1),
            });
        } catch (error) {
            console.error('Increment download error:', error.message);
        }
    },

    /**
     * Increment share count (when share link is accessed)
     */
    async incrementShareCount(id) {
        try {
            await db.collection(COLLECTION).doc(id).update({
                share_count: FieldValue.increment(1),
            });
        } catch (error) {
            console.error('Increment share error:', error.message);
        }
    },

    /**
     * Get aggregate stats for a user
     */
    async getStatsByOwnerId(ownerId) {
        const snapshot = await db.collection(COLLECTION)
            .where('owner_id', '==', ownerId)
            .select('file_size', 'download_count', 'share_count')
            .get();

        const files = snapshot.docs.map(doc => doc.data());
        return {
            totalFiles: files.length,
            totalStorage: files.reduce((sum, f) => sum + (f.file_size || 0), 0),
            totalDownloads: files.reduce((sum, f) => sum + (f.download_count || 0), 0),
            totalShares: files.reduce((sum, f) => sum + (f.share_count || 0), 0),
        };
    },

    /**
     * Check if file is expired
     */
    isExpired(file) {
        return file.expiry && new Date() > new Date(file.expiry);
    },

    /**
     * Check if downloads are available
     */
    hasDownloadsLeft(file) {
        return file.downloadsLeft === -1 || file.downloadsLeft > 0;
    },

    /**
     * Format database document to API format
     */
    formatFile(row) {
        if (!row) return null;
        return {
            id: row.id,
            ownerId: row.owner_id,
            originalFilename: row.original_filename,
            storedFilename: row.stored_filename,
            fileSize: row.file_size,
            encryptedKey: row.encrypted_key,
            iv: row.iv,
            keyIv: row.key_iv,
            salt: row.salt,
            hash: row.hash,
            expiry: row.expiry,
            downloadsLeft: row.downloads_left,
            downloadCount: row.download_count || 0,
            shareCount: row.share_count || 0,
            isPasswordProtected: row.is_password_protected,
            createdAt: row.created_at,
        };
    },

    /**
     * Return public file data (for API response)
     */
    toPublicJSON(file) {
        return {
            id: file.id,
            originalFilename: file.originalFilename,
            fileSize: file.fileSize,
            isPasswordProtected: file.isPasswordProtected,
            expiry: file.expiry,
            downloadsLeft: file.downloadsLeft,
            downloadCount: file.downloadCount,
            shareCount: file.shareCount,
            createdAt: file.createdAt,
        };
    },

    /**
     * Return download metadata (includes encryption params)
     */
    toDownloadJSON(file) {
        return {
            id: file.id,
            originalFilename: file.originalFilename,
            fileSize: file.fileSize,
            encryptedKey: file.encryptedKey,
            iv: file.iv,
            keyIv: file.keyIv,
            salt: file.salt,
            hash: file.hash,
            isPasswordProtected: file.isPasswordProtected,
            expiry: file.expiry,
            downloadsLeft: file.downloadsLeft,
        };
    },
};

module.exports = File;
