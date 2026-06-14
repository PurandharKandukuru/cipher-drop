/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin, Firestore, and exports db instance
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// In production, use GOOGLE_APPLICATION_CREDENTIALS env var or service account JSON
if (!admin.apps.length) {
    const initConfig = {
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'toji-protocol.firebasestorage.app',
    };

    // Resolve credentials in priority order:
    // 1. Service account JSON passed inline via env (production / CI)
    // 2. Explicit credentials file path via GOOGLE_APPLICATION_CREDENTIALS
    // 3. Local serviceAccountKey.json in the backend root (local development)
    const localKeyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        initConfig.credential = admin.credential.cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        );
        console.log('🔑 Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT_KEY');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Uses default credentials from the env var path
        initConfig.credential = admin.credential.applicationDefault();
        console.log('🔑 Firebase credentials loaded from GOOGLE_APPLICATION_CREDENTIALS');
    } else if (fs.existsSync(localKeyPath)) {
        initConfig.credential = admin.credential.cert(require(localKeyPath));
        console.log('🔑 Firebase credentials loaded from serviceAccountKey.json');
    } else {
        console.warn('⚠️  No Firebase credentials found. Using default credentials.');
        console.warn('   Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS in .env');
    }

    admin.initializeApp(initConfig);
}

const db = admin.firestore();

// Firestore settings for production
db.settings({
    ignoreUndefinedProperties: true,
});

console.log('✅ Firebase Admin SDK initialized');
console.log('✅ Firestore client ready');

module.exports = { admin, db };
