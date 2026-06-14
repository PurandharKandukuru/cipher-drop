/**
 * Environment Configuration Validation
 * Uses Zod to validate all required environment variables on startup
 */
const { z } = require('zod');

/**
 * Schema for all environment variables
 * The server will fail to start if any required variables are missing
 */
const envSchema = z.object({
    // Server Configuration
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Firebase Configuration
    FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
    FIREBASE_STORAGE_BUCKET: z.string().min(1, 'FIREBASE_STORAGE_BUCKET is required'),

    // Firebase Admin - either service account key JSON or credentials file path
    FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

    // Optional: Google OAuth (for frontend config reference)
    GOOGLE_CLIENT_ID: z.string().optional(),

    // Optional: Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().optional(),
    RATE_LIMIT_MAX_REQUESTS: z.string().optional(),

    // Optional: File Upload
    MAX_FILE_SIZE: z.string().optional(),
    UPLOAD_DIR: z.string().optional(),

    // Optional: Storage driver ('local' = disk [default], 'firebase' = Cloud Storage)
    STORAGE_DRIVER: z.enum(['local', 'firebase']).optional(),
    STORAGE_DIR: z.string().optional(),

    // Optional: CORS
    ALLOWED_ORIGINS: z.string().optional(),
});

/**
 * Validate environment variables
 * @returns {Object} Validated and typed environment variables
 */
function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('\n❌ Environment Validation Failed:\n');

        result.error.issues.forEach((issue) => {
            console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
        });

        console.error('\n   Please check your .env file and ensure all required variables are set.\n');
        process.exit(1);
    }

    console.log('✅ Environment variables validated');
    return result.data;
}

/**
 * Get validated environment config
 */
const env = validateEnv();

module.exports = { env, validateEnv };
