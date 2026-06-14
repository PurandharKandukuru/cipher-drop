/**
 * Activity Controller
 * Handles activity log API endpoints
 */
const { Activity, ActivityType } = require('../models/Activity');

/**
 * Get activity log for current user
 */
const getActivityLog = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const activities = await Activity.getByUserId(req.user.id, limit);

        res.json({
            success: true,
            data: {
                activities: activities.map(Activity.formatActivity),
                count: activities.length
            }
        });
    } catch (error) {
        console.error('Get activity error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching activity' });
    }
};

/**
 * Get activity for a specific file
 */
const getFileActivity = async (req, res) => {
    try {
        const activities = await Activity.getByFileId(req.params.fileId, 20);

        res.json({
            success: true,
            data: {
                activities: activities.map(Activity.formatActivity),
                count: activities.length
            }
        });
    } catch (error) {
        console.error('Get file activity error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching file activity' });
    }
};

module.exports = { getActivityLog, getFileActivity, Activity, ActivityType };
