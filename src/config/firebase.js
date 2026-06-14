/**
 * Firebase Client SDK Configuration
 * Initializes Firebase Auth for the frontend
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAammal8QNffsum4hP1TT-6a5e_tjccByQ',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'toji-protocol.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'toji-protocol',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'toji-protocol.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '269442951170',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:269442951170:web:8b522f09665dcedad7df1b',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-S43V18CYL6',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;
