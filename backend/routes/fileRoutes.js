const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const {
    uploadFile,
    listFiles,
    getFileMetadata,
    downloadFile,
    deleteFile,
    getStats,
    getWeeklyActivity,
} = require('../controllers/fileController');
const { getActivityLog, getFileActivity } = require('../controllers/activityController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadLimiter, downloadLimiter } = require('../middleware/rateLimiter');

/**
 * Multer Configuration
 * Uses memory storage for Supabase Storage uploads
 */
const storage = multer.memoryStorage();

/**
 * File filter - accept all files (they're already encrypted)
 * Size limit is enforced by multer limits
 */
const fileFilter = (req, file, cb) => {
    // Accept all files - they're encrypted blobs
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default
    },
});

/**
 * @route   POST /api/files/upload
 * @desc    Upload an encrypted file
 * @access  Private
 */
router.post(
    '/upload',
    protect,
    uploadLimiter,
    upload.single('file'),
    uploadFile
);

/**
 * @route   GET /api/files
 * @desc    List all files for authenticated user
 * @access  Private
 */
router.get('/', protect, listFiles);

/**
 * @route   GET /api/files/stats
 * @desc    Get aggregate stats for authenticated user
 * @access  Private
 */
router.get('/stats', protect, getStats);

/**
 * @route   GET /api/files/activity/weekly
 * @desc    Get weekly upload/download activity for charts
 * @access  Private
 */
router.get('/activity/weekly', protect, getWeeklyActivity);

/**
 * @route   GET /api/files/:id
 * @desc    Get file metadata (for download preparation)
 * @access  Public (anyone with link can get metadata)
 */
router.get('/:id', downloadLimiter, optionalAuth, getFileMetadata);

/**
 * @route   GET /api/files/:id/download
 * @desc    Download encrypted file
 * @access  Public (anyone with link can download)
 */
router.get('/:id/download', downloadLimiter, optionalAuth, downloadFile);

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete a file
 * @access  Private (owner only)
 */
router.delete('/:id', protect, deleteFile);

/**
 * @route   GET /api/files/activity
 * @desc    Get activity log for authenticated user
 * @access  Private
 */
router.get('/user/activity', protect, getActivityLog);

/**
 * @route   GET /api/files/:id/activity
 * @desc    Get activity for a specific file
 * @access  Private
 */
router.get('/:id/activity', protect, getFileActivity);

module.exports = router;
