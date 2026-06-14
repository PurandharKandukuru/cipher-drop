/**
 * Activity Model - Firebase Firestore Version
 * Logs file events: upload, download, share, delete
 */
const { db } = require('../config/db');

const COLLECTION = 'activity_logs';

const ActivityType = {
    UPLOAD: 'upload',
    DOWNLOAD: 'download',
    SHARE: 'share',
    DELETE: 'delete',
    VIEW: 'view',
};

const Activity = {
    /**
     * Log a new activity
     */
    async log({ userId, fileId, type, metadata = {} }) {
        try {
            const docRef = db.collection(COLLECTION).doc();
            const data = {
                id: docRef.id,
                user_id: userId,
                file_id: fileId,
                type: type,
                metadata: metadata,
                created_at: new Date().toISOString(),
            };

            await docRef.set(data);
            return data;
        } catch (err) {
            console.error('Activity log error:', err.message);
            return null;
        }
    },

    /**
     * Get activity log for a user
     */
    async getByUserId(userId, limit = 50) {
        try {
            // Single-field equality only (no composite index needed);
            // sort + limit in memory.
            const snapshot = await db.collection(COLLECTION)
                .where('user_id', '==', userId)
                .get();

            const sortedDocs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);

            const activities = [];
            for (const data of sortedDocs) {
                // Manually join file data
                if (data.file_id) {
                    const fileDoc = await db.collection('files').doc(data.file_id).get();
                    if (fileDoc.exists) {
                        data.files = {
                            id: fileDoc.id,
                            original_filename: fileDoc.data().original_filename,
                            file_size: fileDoc.data().file_size,
                        };
                    }
                }

                activities.push(data);
            }

            return activities;
        } catch (error) {
            console.error('Get activities error:', error.message);
            return [];
        }
    },

    /**
     * Get activity log for a specific file
     */
    async getByFileId(fileId, limit = 20) {
        try {
            // Single-field equality only (no composite index needed);
            // sort + limit in memory.
            const snapshot = await db.collection(COLLECTION)
                .where('file_id', '==', fileId)
                .get();

            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);
        } catch (error) {
            console.error('Get file activities error:', error.message);
            return [];
        }
    },

    /**
     * Get weekly stats for uploads and downloads (last 7 days)
     * Returns data formatted for charts
     */
    async getWeeklyStats(userId) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        try {
            // Single-field equality only (no composite index needed);
            // filter by type + date window in memory.
            const sevenDaysAgoISO = sevenDaysAgo.toISOString();
            const snapshot = await db.collection(COLLECTION)
                .where('user_id', '==', userId)
                .get();

            // Initialize weekly data
            const weeklyMap = {};
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayName = dayNames[date.getDay()];
                weeklyMap[dayName] = { name: dayName, uploads: 0, downloads: 0 };
            }

            // Aggregate activity data
            snapshot.docs.forEach(doc => {
                const activity = doc.data();

                // Only uploads/downloads within the last 7 days
                if (activity.type !== 'upload' && activity.type !== 'download') return;
                if (!activity.created_at || activity.created_at < sevenDaysAgoISO) return;

                const activityDate = new Date(activity.created_at);
                const dayName = dayNames[activityDate.getDay()];

                if (weeklyMap[dayName]) {
                    if (activity.type === 'upload') {
                        weeklyMap[dayName].uploads++;
                    } else if (activity.type === 'download') {
                        weeklyMap[dayName].downloads++;
                    }
                }
            });

            // Convert to array maintaining order
            const result = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayName = dayNames[date.getDay()];
                result.push(weeklyMap[dayName]);
            }

            return result;
        } catch (error) {
            console.error('Get weekly stats error:', error.message);
            return dayNames.map(name => ({ name, uploads: 0, downloads: 0 }));
        }
    },

    /**
     * Format activity for API response
     */
    formatActivity(activity) {
        return {
            id: activity.id,
            type: activity.type,
            fileId: activity.file_id,
            fileName: activity.files?.original_filename || 'Unknown file',
            fileSize: activity.files?.file_size,
            metadata: activity.metadata,
            createdAt: activity.created_at,
        };
    },
};

module.exports = { Activity, ActivityType };
