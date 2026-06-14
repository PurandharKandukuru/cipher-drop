/**
 * Storage Configuration
 *
 * Supports two drivers, selected via the STORAGE_DRIVER env var:
 *   - 'local'    : stores encrypted blobs on the local disk (DEFAULT).
 *                  Works without provisioning Firebase Storage / a Blaze plan.
 *   - 'firebase' : Firebase Cloud Storage (requires a provisioned bucket).
 *
 * Files are encrypted client-side (zero-knowledge), so the server only ever
 * stores opaque ciphertext regardless of which driver is active.
 *
 * Both drivers expose the same minimal bucket interface the app relies on:
 *   bucket.file(name).save(buffer, options)
 *   bucket.file(name).download()  -> [Buffer]
 *   bucket.file(name).delete()
 *   bucket.file(name).exists()    -> [boolean]
 */
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const DRIVER = (process.env.STORAGE_DRIVER || 'local').toLowerCase();

/**
 * Local-disk bucket shim mirroring the subset of the GCS bucket API the app uses.
 */
function createLocalBucket() {
    // STORAGE_DIR may be relative (dev) or an absolute path to a mounted
    // persistent volume (production), e.g. /var/data on Render, /data on Fly.
    const dir = process.env.STORAGE_DIR || 'storage';
    const root = path.isAbsolute(dir) ? dir : path.join(__dirname, '..', dir);

    // Resolve a stored filename to an absolute path, guarding against traversal
    // while preserving the relative structure (e.g. encrypted-files/<uuid>.enc).
    const resolvePath = (name) => {
        const normalized = path.normalize(name).replace(/^(\.\.(\/|\\|$))+/, '');
        return path.join(root, normalized);
    };

    return {
        name: `local-disk (${root})`,
        file(name) {
            const fullPath = resolvePath(name);
            return {
                name,
                async save(buffer /* , options */) {
                    await fsp.mkdir(path.dirname(fullPath), { recursive: true });
                    await fsp.writeFile(fullPath, buffer);
                },
                async download() {
                    const buffer = await fsp.readFile(fullPath);
                    return [buffer];
                },
                async delete() {
                    await fsp.unlink(fullPath);
                },
                async exists() {
                    return [fs.existsSync(fullPath)];
                },
            };
        },
    };
}

let bucket;

if (DRIVER === 'firebase') {
    const { admin } = require('./db');
    bucket = admin.storage().bucket();
    console.log(`✅ Firebase Storage initialized (bucket: ${bucket.name})`);
} else {
    bucket = createLocalBucket();
    console.log(`✅ Local disk storage initialized (${bucket.name})`);

    // Guard against a common production footgun: local disk on an ephemeral host.
    if (process.env.NODE_ENV === 'production' && !path.isAbsolute(process.env.STORAGE_DIR || '')) {
        console.warn(
            '\n⚠️  PRODUCTION + STORAGE_DRIVER=local with a non-absolute STORAGE_DIR.\n' +
            '   On hosts with an ephemeral filesystem (Render/Railway/Heroku/Cloud Run/\n' +
            '   serverless) uploaded files are wiped on every restart, redeploy or scale,\n' +
            '   and download links will return 404 "File not found in storage".\n' +
            '   Fix: mount a persistent volume and set STORAGE_DIR to its absolute path\n' +
            '   (single instance), OR use durable object storage (STORAGE_DRIVER=firebase\n' +
            '   or an S3-compatible bucket).\n'
        );
    }
}

module.exports = { bucket };
