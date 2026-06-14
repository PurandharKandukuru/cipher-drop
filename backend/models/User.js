/**
 * User Model - Firebase Firestore Version
 * Handles user operations with Firestore
 */
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

const COLLECTION = 'users';

const User = {
    /**
     * Create a new user
     */
    async create({ email, password }) {
        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if user already exists
        const existing = await User.findByEmail(email);
        if (existing) {
            throw new Error('User with this email already exists');
        }

        const docRef = db.collection(COLLECTION).doc();
        const userData = {
            id: docRef.id,
            email: email.toLowerCase(),
            password_hash: passwordHash,
            created_at: new Date().toISOString(),
        };

        await docRef.set(userData);
        return { id: docRef.id, ...userData };
    },

    /**
     * Find user by email
     */
    async findByEmail(email) {
        const snapshot = await db.collection(COLLECTION)
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    },

    /**
     * Find user by ID
     */
    async findById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return {
            id: doc.id,
            email: data.email,
            name: data.name,
            avatar_url: data.avatar_url,
            created_at: data.created_at,
        };
    },

    /**
     * Find user by Firebase Auth UID
     */
    async findByFirebaseUid(uid) {
        const snapshot = await db.collection(COLLECTION)
            .where('firebase_uid', '==', uid)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    },

    /**
     * Compare password with stored hash
     */
    async comparePassword(candidatePassword, passwordHash) {
        return await bcrypt.compare(candidatePassword, passwordHash);
    },

    /**
     * Create or find user from Firebase Auth token
     * Used when frontend authenticates with Firebase Auth
     */
    async findOrCreateFromFirebaseAuth({ uid, email, name, picture }) {
        // First try to find by Firebase UID
        let user = await User.findByFirebaseUid(uid);
        if (user) return user;

        // Try to find by email (existing user linking)
        user = await User.findByEmail(email);
        if (user) {
            // Link Firebase UID to existing user
            await db.collection(COLLECTION).doc(user.id).update({
                firebase_uid: uid,
                name: name || user.name,
                avatar_url: picture || user.avatar_url,
            });
            return { ...user, firebase_uid: uid };
        }

        // Create new user
        const docRef = db.collection(COLLECTION).doc();
        const userData = {
            id: docRef.id,
            email: email.toLowerCase(),
            firebase_uid: uid,
            name: name || email.split('@')[0],
            avatar_url: picture || null,
            password_hash: null, // No password for Firebase Auth users
            created_at: new Date().toISOString(),
        };

        await docRef.set(userData);
        return { id: docRef.id, ...userData };
    },

    /**
     * Create user via Google OAuth (no password needed)
     */
    async createWithGoogle({ email, name, googleId, picture }) {
        // Check if user already exists
        const existing = await User.findByEmail(email);
        if (existing) return existing;

        const docRef = db.collection(COLLECTION).doc();
        const userData = {
            id: docRef.id,
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            google_id: googleId,
            avatar_url: picture || null,
            password_hash: null,
            created_at: new Date().toISOString(),
        };

        await docRef.set(userData);
        return { id: docRef.id, ...userData };
    },

    /**
     * Format user for API response (remove sensitive data)
     */
    toJSON(user) {
        if (!user) return null;
        const { password_hash, firebase_uid, ...safeUser } = user;
        return safeUser;
    }
};

module.exports = User;
