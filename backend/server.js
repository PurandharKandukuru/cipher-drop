/**
 * Server Entry Point - Firebase Production Hardened
 */
require('dotenv').config();

// Validate environment variables first (will exit if invalid)
const { env } = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Initialize Firebase (Firestore + Storage)
require('./config/db');
require('./config/storage');

// Middleware
const { requestIdMiddleware } = require('./utils/requestId');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const shareRoutes = require('./routes/shareRoutes');

const app = express();

// Create uploads directory (for temporary files if needed)
const uploadsDir = path.join(__dirname, env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Request ID middleware (must be first for audit trail)
app.use(requestIdMiddleware);

// Logging middleware - different format for dev vs prod
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(generalLimiter);

// Health check endpoint with enhanced info
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Cipher Drop API',
        version: '3.0.0',
        environment: env.NODE_ENV,
        storage: 'Firebase Cloud Storage',
        database: 'Firebase Firestore',
        auth: 'Firebase Authentication',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/shares', shareRoutes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
🔒 ====================================== 🔒
   CIPHER DROP - SECURE FILE SHARING API
   Database: Firebase Firestore
   Storage: ${(process.env.STORAGE_DRIVER || 'local') === 'firebase' ? 'Firebase Cloud Storage' : 'Local Disk'}
   Auth: Firebase Authentication
   Security: Production Hardened
🔒 ====================================== 🔒

🚀 Server running on port ${PORT}
🌍 Environment: ${env.NODE_ENV}
📝 Request logging: ${env.NODE_ENV === 'development' ? 'dev (colored)' : 'combined (Apache)'}
🔐 Firebase Auth: Enabled
🔐 Request ID tracking: Enabled

📌 API Endpoints:
   Auth:
   POST   /api/auth/firebase
   GET    /api/auth/me

   Files:
   POST   /api/files/upload
   GET    /api/files
   GET    /api/files/stats
   GET    /api/files/:id
   GET    /api/files/:id/download
   DELETE /api/files/:id

   Share Links:
   POST   /api/shares
   GET    /api/shares
   GET    /api/shares/:token
   GET    /api/shares/:token/download
   DELETE /api/shares/:id
  `);
});

module.exports = app;
