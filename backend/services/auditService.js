/**
 * Audit Service - Firebase Firestore Version
 * Tamper-Resistant Logging with chained hashes for integrity verification
 */
const crypto = require('crypto');
const { db } = require('../config/db');

const COLLECTION = 'activity_logs';

const AuditEventType = {
    FILE_UPLOAD: 'file_upload',
    FILE_DOWNLOAD: 'file_download',
    FILE_DELETE: 'file_delete',
    FILE_VIEW: 'file_view',
    SHARE_LINK_CREATE: 'share_link_create',
    SHARE_LINK_ACCESS: 'share_link_access',
    SHARE_LINK_REVOKE: 'share_link_revoke',
    ACCESS_DENIED: 'access_denied',
    AUTH_LOGIN: 'auth_login',
    AUTH_REGISTER: 'auth_register',
    AUTH_FAILED: 'auth_failed',
};

/**
 * Generate SHA-256 hash for audit log entry
 */
const generateLogHash = (entry, prevHash) => {
    const data = JSON.stringify({
        ...entry,
        prevHash: prevHash || 'GENESIS',
    });
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Get the last audit log hash for chain integrity
 */
const getLastLogHash = async () => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .orderBy('created_at', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return snapshot.docs[0].data().hash || null;
    } catch (error) {
        console.error('Failed to get last log hash:', error.message);
        return null;
    }
};

/**
 * Log an audit event with tamper-resistant chaining
 */
const logEvent = async ({
    userId,
    fileId = null,
    shareLinkId = null,
    eventType,
    metadata = {},
    req = null,
}) => {
    try {
        // Build log entry
        const entry = {
            user_id: userId,
            file_id: fileId,
            share_link_id: shareLinkId,
            type: eventType,
            metadata,
            ip_address: req?.ip || req?.connection?.remoteAddress || null,
            user_agent: req?.headers?.['user-agent'] || null,
            request_id: req?.requestId || null,
            created_at: new Date().toISOString(),
        };

        // Get previous hash for chain
        const prevHash = await getLastLogHash();

        // Generate hash for this entry
        entry.prev_hash = prevHash;
        entry.hash = generateLogHash(entry, prevHash);

        // Insert log entry to Firestore
        const docRef = db.collection(COLLECTION).doc();
        entry.id = docRef.id;
        await docRef.set(entry);

        return entry;
    } catch (err) {
        console.error('Audit log error:', err.message);
        return null;
    }
};

/**
 * Verify audit log chain integrity
 * Returns { valid: boolean, brokenAt: number | null }
 */
const verifyLogChain = async (limit = 100) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .orderBy('created_at', 'asc')
            .limit(limit)
            .get();

        if (snapshot.empty) {
            return { valid: true, count: 0 };
        }

        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let prevHash = null;
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            const expectedHash = generateLogHash({
                user_id: log.user_id,
                file_id: log.file_id,
                share_link_id: log.share_link_id,
                type: log.type,
                metadata: log.metadata,
                ip_address: log.ip_address,
                user_agent: log.user_agent,
                request_id: log.request_id,
                created_at: log.created_at,
                prev_hash: log.prev_hash,
            }, log.prev_hash);

            if (log.hash !== expectedHash) {
                return { valid: false, brokenAt: i, logId: log.id };
            }

            if (i > 0 && log.prev_hash !== prevHash) {
                return { valid: false, brokenAt: i, logId: log.id, reason: 'chain_broken' };
            }

            prevHash = log.hash;
        }

        return { valid: true, count: logs.length };
    } catch (error) {
        console.error('Failed to verify log chain:', error.message);
        return { valid: false, error: error.message };
    }
};

/**
 * Convenience methods for common events
 */
const AuditService = {
    logEvent,
    verifyLogChain,
    AuditEventType,

    // File events
    logFileUpload: (userId, fileId, metadata, req) =>
        logEvent({ userId, fileId, eventType: AuditEventType.FILE_UPLOAD, metadata, req }),

    logFileDownload: (userId, fileId, metadata, req) =>
        logEvent({ userId, fileId, eventType: AuditEventType.FILE_DOWNLOAD, metadata, req }),

    logFileDelete: (userId, fileId, metadata, req) =>
        logEvent({ userId, fileId, eventType: AuditEventType.FILE_DELETE, metadata, req }),

    logFileView: (userId, fileId, metadata, req) =>
        logEvent({ userId, fileId, eventType: AuditEventType.FILE_VIEW, metadata, req }),

    // Share link events
    logShareLinkCreate: (userId, fileId, shareLinkId, metadata, req) =>
        logEvent({ userId, fileId, shareLinkId, eventType: AuditEventType.SHARE_LINK_CREATE, metadata, req }),

    logShareLinkAccess: (userId, fileId, shareLinkId, metadata, req) =>
        logEvent({ userId, fileId, shareLinkId, eventType: AuditEventType.SHARE_LINK_ACCESS, metadata, req }),

    logShareLinkRevoke: (userId, fileId, shareLinkId, metadata, req) =>
        logEvent({ userId, fileId, shareLinkId, eventType: AuditEventType.SHARE_LINK_REVOKE, metadata, req }),

    // Access events
    logAccessDenied: (userId, fileId, metadata, req) =>
        logEvent({ userId, fileId, eventType: AuditEventType.ACCESS_DENIED, metadata, req }),

    // Auth events
    logAuthLogin: (userId, metadata, req) =>
        logEvent({ userId, eventType: AuditEventType.AUTH_LOGIN, metadata, req }),

    logAuthRegister: (userId, metadata, req) =>
        logEvent({ userId, eventType: AuditEventType.AUTH_REGISTER, metadata, req }),

    logAuthFailed: (userId, metadata, req) =>
        logEvent({ userId, eventType: AuditEventType.AUTH_FAILED, metadata, req }),
};

module.exports = AuditService;
