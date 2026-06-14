/**
 * Authentication Controller - Firebase Version
 * Uses Firebase Admin SDK to verify ID tokens from the frontend
 */
const { admin } = require('../config/db');
const User = require('../models/User');

/**
 * Authenticate with Firebase ID Token
 * Frontend sends the Firebase ID token, backend verifies it and returns user data
 * This replaces the old register/login/googleAuth endpoints
 */
const firebaseAuth = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'Firebase ID token is required',
            });
        }

        // Verify the token with Firebase Admin SDK
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (verifyError) {
            console.error('Firebase token verification failed:', verifyError.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired Firebase token',
            });
        }

        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email not provided in Firebase token',
            });
        }

        // Find or create user in Firestore
        const user = await User.findOrCreateFromFirebaseAuth({
            uid,
            email,
            name: name || decodedToken.displayName,
            picture: picture || decodedToken.photoURL,
        });

        console.log(`✅ Firebase auth successful for: ${email}`);

        res.json({
            success: true,
            message: 'Authentication successful',
            data: {
                user: User.toJSON(user),
            },
        });
    } catch (error) {
        console.error('Firebase auth error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication',
        });
    }
};

/**
 * Get current user profile
 * Uses Firebase Auth middleware - req.user is already set
 */
const getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: User.toJSON(req.user),
            },
        });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
        });
    }
};

module.exports = { firebaseAuth, getMe };
