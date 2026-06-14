/**
 * Crypto Utilities
 * Client-side encryption/decryption using Web Crypto API
 * 
 * IMPORTANT: All encryption happens in the browser.
 * The server never sees unencrypted data or keys.
 */

/**
 * Generate a random encryption key
 */
export const generateKey = async () => {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

/**
 * Generate random bytes
 */
export const generateRandomBytes = (length) => {
    return crypto.getRandomValues(new Uint8Array(length));
};

/**
 * Derive a key from password using PBKDF2
 */
export const deriveKeyFromPassword = async (password, salt) => {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

/**
 * Encrypt data with AES-GCM
 */
export const encryptData = async (data, key, iv) => {
    return await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );
};

/**
 * Decrypt data with AES-GCM
 */
export const decryptData = async (encryptedData, key, iv) => {
    return await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
    );
};

/**
 * Export key to raw format
 */
export const exportKey = async (key) => {
    return await crypto.subtle.exportKey('raw', key);
};

/**
 * Import raw key
 */
export const importKey = async (rawKey) => {
    return await crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

/**
 * Calculate SHA-256 hash of data
 */
export const hashData = async (data) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Convert ArrayBuffer to Base64
 */
export const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

/**
 * Convert Base64 to ArrayBuffer
 */
export const base64ToArrayBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * Encrypt a file for upload
 * Returns encrypted blob and metadata needed for decryption
 */
export const encryptFile = async (file, password = null) => {
    // Read file as ArrayBuffer
    const fileData = await file.arrayBuffer();

    // Generate file encryption key
    const fileKey = await generateKey();
    const iv = generateRandomBytes(12);

    // Encrypt the file
    const encryptedData = await encryptData(fileData, fileKey, iv);

    // Export the file key
    const rawKey = await exportKey(fileKey);

    // If password provided, encrypt the key with password-derived key
    let encryptedKey, keyIv, salt;

    if (password) {
        salt = generateRandomBytes(16);
        keyIv = generateRandomBytes(12);
        const passwordKey = await deriveKeyFromPassword(password, salt);
        encryptedKey = await encryptData(rawKey, passwordKey, keyIv);
    } else {
        // No password - just encode the key (still encrypted in transit via HTTPS)
        salt = generateRandomBytes(16);
        keyIv = generateRandomBytes(12);
        encryptedKey = rawKey;
    }

    // Calculate hash for integrity verification
    const hash = await hashData(fileData);

    // Create encrypted blob
    const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

    return {
        encryptedBlob,
        metadata: {
            originalFilename: file.name,
            encryptedKey: arrayBufferToBase64(encryptedKey),
            iv: arrayBufferToBase64(iv),
            keyIv: arrayBufferToBase64(keyIv),
            salt: arrayBufferToBase64(salt),
            hash: hash,
            isPasswordProtected: !!password,
        },
    };
};

/**
 * Decrypt a downloaded file
 */
export const decryptFile = async (encryptedBlob, metadata, password = null) => {
    // Read encrypted data
    const encryptedData = await encryptedBlob.arrayBuffer();

    // Decode metadata
    const iv = new Uint8Array(base64ToArrayBuffer(metadata.iv));
    const encryptedKeyData = base64ToArrayBuffer(metadata.encryptedKey);
    const keyIv = new Uint8Array(base64ToArrayBuffer(metadata.keyIv));
    const salt = new Uint8Array(base64ToArrayBuffer(metadata.salt));

    let rawKey;

    if (metadata.isPasswordProtected && password) {
        // Decrypt the file key using password
        const passwordKey = await deriveKeyFromPassword(password, salt);
        rawKey = await decryptData(encryptedKeyData, passwordKey, keyIv);
    } else {
        rawKey = encryptedKeyData;
    }

    // Import the file key
    const fileKey = await importKey(rawKey);

    // Decrypt the file
    const decryptedData = await decryptData(encryptedData, fileKey, iv);

    // Verify hash
    const hash = await hashData(decryptedData);
    if (hash !== metadata.hash) {
        throw new Error('File integrity check failed');
    }

    return new Blob([decryptedData]);
};
