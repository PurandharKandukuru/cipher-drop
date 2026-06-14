/**
 * Auth Context - Firebase Version
 * Provides Firebase authentication state across the app
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                // Firebase auth is the source of truth — authenticate immediately so
                // protected routes are reachable without waiting on the backend sync.
                setFirebaseUser(fbUser);
                setUser({
                    email: fbUser.email,
                    name: fbUser.displayName,
                    avatar_url: fbUser.photoURL,
                });
                setIsAuthenticated(true);
                setIsLoading(false);

                // Enrich the profile from the backend in the background (non-blocking).
                try {
                    const idToken = await fbUser.getIdToken();
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

                    const response = await fetch(`${API_BASE_URL}/auth/firebase`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    });

                    const data = await response.json();
                    if (data.success && data.data?.user) {
                        setUser(data.data.user);
                    }
                } catch (error) {
                    console.error('Backend auth sync error:', error);
                }
            } else {
                setUser(null);
                setFirebaseUser(null);
                setIsAuthenticated(false);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    /**
     * Login user with email/password
     */
    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result;
    };

    /**
     * Register user with email/password
     */
    const register = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result;
    };

    /**
     * Sign in with Google
     */
    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    };

    /**
     * Logout user
     */
    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
    };

    /**
     * Get current Firebase ID token (for API calls)
     */
    const getIdToken = async () => {
        if (firebaseUser) {
            return await firebaseUser.getIdToken();
        }
        return null;
    };

    const value = {
        user,
        firebaseUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        signInWithGoogle,
        logout,
        getIdToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
