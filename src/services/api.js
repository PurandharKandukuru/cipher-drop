/**
 * API Configuration and Base Client - Firebase Version
 * Uses Firebase ID tokens for authentication
 */
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get Firebase ID token for authenticated requests
 */
const getToken = async () => {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

/**
 * Base fetch wrapper with Firebase auth and error handling
 */
const apiRequest = async (endpoint, options = {}) => {
    const token = await getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
};

/**
 * Auth API endpoints
 */
export const authAPI = {
    /**
     * Sync user with backend (called automatically by AuthContext)
     */
    syncWithBackend: async (idToken) => {
        return await apiRequest('/auth/firebase', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        });
    },

    /**
     * Get current user profile from backend
     */
    getProfile: async () => {
        return await apiRequest('/auth/me');
    },

    /**
     * Check if user is authenticated (Firebase Auth)
     */
    isAuthenticated: () => {
        return !!auth.currentUser;
    },

    /**
     * Get stored user data from Firebase
     */
    getUser: () => {
        const user = auth.currentUser;
        if (!user) return null;
        return {
            email: user.email,
            name: user.displayName,
            avatar_url: user.photoURL,
        };
    },
};

/**
 * Files API endpoints
 */
export const filesAPI = {
    /**
     * Upload an encrypted file
     * @param {File} file - The encrypted file blob
     * @param {Object} metadata - Encryption metadata
     */
    upload: async (file, metadata) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('originalFilename', metadata.originalFilename);
        formData.append('encryptedKey', metadata.encryptedKey);
        formData.append('iv', metadata.iv);
        formData.append('keyIv', metadata.keyIv);
        formData.append('salt', metadata.salt);
        formData.append('hash', metadata.hash);
        formData.append('expiry', metadata.expiry || '7');
        formData.append('downloadsLimit', metadata.downloadsLimit || '-1');
        formData.append('isPasswordProtected', metadata.isPasswordProtected || 'false');

        return await apiRequest('/files/upload', {
            method: 'POST',
            body: formData,
        });
    },

    /**
     * List all files for current user
     */
    listFiles: async () => {
        return await apiRequest('/files');
    },

    /**
     * Get aggregate stats for current user
     */
    getStats: async () => {
        return await apiRequest('/files/stats');
    },

    /**
     * Get file metadata for download
     */
    getFileMetadata: async (fileId) => {
        return await apiRequest(`/files/${fileId}`);
    },

    /**
     * Download encrypted file
     */
    downloadFile: async (fileId) => {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Download failed');
        }

        return await response.blob();
    },

    /**
     * Delete a file
     */
    deleteFile: async (fileId) => {
        return await apiRequest(`/files/${fileId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Get activity log for current user
     */
    getActivity: async (limit = 50) => {
        return await apiRequest(`/files/user/activity?limit=${limit}`);
    },

    /**
     * Get weekly activity stats for charts (uploads & downloads per day)
     */
    getWeeklyActivity: async () => {
        return await apiRequest('/files/activity/weekly');
    },
};

export default { authAPI, filesAPI };
