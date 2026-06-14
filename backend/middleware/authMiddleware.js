/**
 * Authentication Middleware - Firebase Version
 * Verifies Firebase ID tokens from Authorization header
 */
const { admin } = require('../config/db');
const User = require('../models/User');

/**
 * Protect routes - requires valid Firebase ID token
 */
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized - no token' });
        }

        try {
            // Verify Firebase ID token
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Find or create user record in Firestore
            const user = await User.findOrCreateFromFirebaseAuth({
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.displayName,
                picture: decodedToken.picture || decodedToken.photoURL,
            });

            if (!user) {
                return res.status(401).json({ success: false, message: 'Not authorized - user not found' });
            }

            req.user = user;
            req.firebaseUser = decodedToken; // Also attach decoded Firebase token
            next();
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError.message);
            return res.status(401).json({ success: false, message: 'Not authorized - invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during authentication' });
    }
};

/**
 * Optional auth - attaches user if token present, continues otherwise
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                const user = await User.findOrCreateFromFirebaseAuth({
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    name: decodedToken.name || decodedToken.displayName,
                    picture: decodedToken.picture || decodedToken.photoURL,
                });
                if (user) {
                    req.user = user;
                    req.firebaseUser = decodedToken;
                }
            } catch { }
        }
        next();
    } catch {
        next();
    }
};

module.exports = { protect, optionalAuth };
