/**
 * ShareLink Model - Firebase Firestore Version
 * Handles secure share link operations
 */
const crypto = require('crypto');
const { db } = require('../config/db');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION = 'share_links';

const ShareLink = {
    /**
     * Generate a cryptographically secure token
     */
    generateToken() {
        return crypto.randomBytes(16).toString('hex'); // 32 characters
    },

    /**
     * Create a new share link
     */
    async create({ fileId, createdBy, expiresIn, isOneTime, maxDownloads }) {
        const token = this.generateToken();

        let expiresAt = null;
        if (expiresIn && expiresIn > 0) {
            expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString();
        }

        const docRef = db.collection(COLLECTION).doc();
        const data = {
            id: docRef.id,
            file_id: fileId,
            created_by: createdBy,
            token,
            expires_at: expiresAt,
            is_one_time: isOneTime || false,
            max_downloads: maxDownloads || -1,
            download_count: 0,
            is_active: true,
            created_at: new Date().toISOString(),
        };

        await docRef.set(data);
        return ShareLink.formatShareLink(data);
    },

    /**
     * Find share link by token
     */
    async findByToken(token) {
        const snapshot = await db.collection(COLLECTION)
            .where('token', '==', token)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        const shareLinkData = { id: doc.id, ...doc.data() };

        // Manually join file data
        if (shareLinkData.file_id) {
            const fileDoc = await db.collection('files').doc(shareLinkData.file_id).get();
            if (fileDoc.exists) {
                const fileData = fileDoc.data();
                shareLinkData.files = {
                    id: fileDoc.id,
                    owner_id: fileData.owner_id,
                    original_filename: fileData.original_filename,
                    file_size: fileData.file_size,
                    encrypted_key: fileData.encrypted_key,
                    iv: fileData.iv,
                    key_iv: fileData.key_iv,
                    salt: fileData.salt,
                    hash: fileData.hash,
                    expiry: fileData.expiry,
                    downloads_left: fileData.downloads_left,
                    is_password_protected: fileData.is_password_protected,
                };
            }
        }

        return ShareLink.formatShareLink(shareLinkData);
    },

    /**
     * Find share link by ID
     */
    async findById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return ShareLink.formatShareLink({ id: doc.id, ...doc.data() });
    },

    /**
     * Find all share links for a file
     */
    async findByFileId(fileId) {
        const snapshot = await db.collection(COLLECTION)
            .where('file_id', '==', fileId)
            .orderBy('created_at', 'desc')
            .get();

        return snapshot.docs.map(doc =>
            ShareLink.formatShareLink({ id: doc.id, ...doc.data() })
        );
    },

    /**
     * Find all share links created by a user
     */
    async findByUserId(userId) {
        const snapshot = await db.collection(COLLECTION)
            .where('created_by', '==', userId)
            .orderBy('created_at', 'desc')
            .get();

        // Manually join file data for each share link
        const results = [];
        for (const doc of snapshot.docs) {
            const data = { id: doc.id, ...doc.data() };

            if (data.file_id) {
                const fileDoc = await db.collection('files').doc(data.file_id).get();
                if (fileDoc.exists) {
                    const fileData = fileDoc.data();
                    data.files = {
                        id: fileDoc.id,
                        original_filename: fileData.original_filename,
                        file_size: fileData.file_size,
                    };
                }
            }

            results.push(ShareLink.formatShareLink(data));
        }

        return results;
    },

    /**
     * Increment download count
     */
    async incrementDownloadCount(id) {
        try {
            await db.collection(COLLECTION).doc(id).update({
                download_count: FieldValue.increment(1),
            });
        } catch (error) {
            console.error('Increment share download error:', error.message);
        }
    },

    /**
     * Deactivate a share link (for one-time links after use)
     */
    async deactivate(id) {
        await db.collection(COLLECTION).doc(id).update({
            is_active: false,
        });
        return true;
    },

    /**
     * Revoke a share link
     */
    async revoke(id) {
        return await ShareLink.deactivate(id);
    },

    /**
     * Delete share link
     */
    async deleteById(id) {
        await db.collection(COLLECTION).doc(id).delete();
        return true;
    },

    /**
     * Check if share link is valid for access
     */
    isValid(shareLink) {
        if (!shareLink) return false;
        if (!shareLink.isActive) return false;
        return true;
    },

    /**
     * Check if share link is expired
     */
    isExpired(shareLink) {
        if (!shareLink.expiresAt) return false;
        return new Date() > new Date(shareLink.expiresAt);
    },

    /**
     * Check if download limit reached
     */
    hasDownloadsLeft(shareLink) {
        if (shareLink.maxDownloads === -1) return true;
        return shareLink.downloadCount < shareLink.maxDownloads;
    },

    /**
     * Format database document to API format
     */
    formatShareLink(row) {
        if (!row) return null;
        return {
            id: row.id,
            fileId: row.file_id,
            createdBy: row.created_by,
            token: row.token,
            expiresAt: row.expires_at,
            isOneTime: row.is_one_time,
            maxDownloads: row.max_downloads,
            downloadCount: row.download_count,
            isActive: row.is_active,
            createdAt: row.created_at,
            // Include file data if joined
            file: row.files ? {
                id: row.files.id,
                ownerId: row.files.owner_id,
                originalFilename: row.files.original_filename,
                fileSize: row.files.file_size,
                encryptedKey: row.files.encrypted_key,
                iv: row.files.iv,
                keyIv: row.files.key_iv,
                salt: row.files.salt,
                hash: row.files.hash,
                expiry: row.files.expiry,
                downloadsLeft: row.files.downloads_left,
                isPasswordProtected: row.files.is_password_protected,
            } : null,
        };
    },

    /**
     * Return public share link data (for API response)
     */
    toPublicJSON(shareLink) {
        return {
            id: shareLink.id,
            token: shareLink.token,
            expiresAt: shareLink.expiresAt,
            isOneTime: shareLink.isOneTime,
            maxDownloads: shareLink.maxDownloads,
            downloadCount: shareLink.downloadCount,
            isActive: shareLink.isActive,
            createdAt: shareLink.createdAt,
            file: shareLink.file ? {
                originalFilename: shareLink.file.originalFilename,
                fileSize: shareLink.file.fileSize,
            } : null,
        };
    },
};

module.exports = ShareLink;
