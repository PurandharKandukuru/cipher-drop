# Firestore Schema Documentation

## Collections

### `users/{userId}`
| Field | Type | Description |
|-------|------|-------------|
| id | string | Document ID (auto-generated) |
| email | string | User email (lowercase) |
| password_hash | string | nullable | bcrypt hash (null for Firebase Auth users) |
| firebase_uid | string | Firebase Auth UID |
| name | string | nullable | Display name |
| google_id | string | nullable | Google OAuth ID |
| avatar_url | string | nullable | Profile picture URL |
| created_at | string (ISO 8601) | Account creation timestamp |

**Indexes:**
- `email` (equality)
- `firebase_uid` (equality)

---

### `files/{fileId}`
| Field | Type | Description |
|-------|------|-------------|
| id | string | Document ID (auto-generated) |
| owner_id | string | Reference to users collection |
| original_filename | string | Sanitized original filename |
| stored_filename | string | UUID-based path in Firebase Storage |
| file_size | number | File size in bytes |
| encrypted_key | string | AES-256-GCM encrypted key (base64) |
| iv | string | Initialization vector (base64) |
| key_iv | string | Key IV for password-protected files |
| salt | string | PBKDF2 salt for password-protected files |
| hash | string | File integrity hash |
| expiry | string (ISO 8601) | nullable | Expiration timestamp |
| downloads_left | number | Remaining downloads (-1 = unlimited) |
| download_count | number | Total downloads |
| share_count | number | Total share link accesses |
| is_password_protected | boolean | Whether file requires password |
| created_at | string (ISO 8601) | Upload timestamp |

**Indexes:**
- `owner_id` + `created_at` (composite, descending)

---

### `share_links/{linkId}`
| Field | Type | Description |
|-------|------|-------------|
| id | string | Document ID (auto-generated) |
| file_id | string | Reference to files collection |
| created_by | string | Reference to users collection |
| token | string | Cryptographically secure share token (32 chars) |
| expires_at | string (ISO 8601) | nullable | Link expiration |
| is_one_time | boolean | Whether link can only be used once |
| max_downloads | number | Maximum downloads (-1 = unlimited) |
| download_count | number | Current download count |
| is_active | boolean | Whether link is still active |
| created_at | string (ISO 8601) | Creation timestamp |

**Indexes:**
- `token` (equality)
- `file_id` + `created_at` (composite, descending)
- `created_by` + `created_at` (composite, descending)

---

### `activity_logs/{logId}`
| Field | Type | Description |
|-------|------|-------------|
| id | string | Document ID (auto-generated) |
| user_id | string | nullable | Reference to users collection |
| file_id | string | nullable | Reference to files collection |
| share_link_id | string | nullable | Reference to share_links collection |
| type | string | Event type (see AuditEventType enum) |
| metadata | object | Event-specific metadata |
| ip_address | string | nullable | Client IP address |
| user_agent | string | nullable | Client user agent |
| request_id | string | nullable | Request correlation ID |
| hash | string | SHA-256 hash for tamper detection |
| prev_hash | string | nullable | Previous log entry hash (chain) |
| created_at | string (ISO 8601) | Event timestamp |

**Event Types:**
- `file_upload`, `file_download`, `file_delete`, `file_view`
- `share_link_create`, `share_link_access`, `share_link_revoke`
- `access_denied`, `auth_login`, `auth_register`, `auth_failed`
- `upload`, `download`, `share`, `delete`, `view` (activity types)

**Indexes:**
- `user_id` + `created_at` (composite, descending)
- `user_id` + `type` + `created_at` (composite, for weekly stats)
- `file_id` + `created_at` (composite, descending)
- `created_at` (ascending, for chain verification)

---

## Firebase Storage Structure

```
/encrypted-files/{uuid}.enc    # Encrypted file blobs
```

All files stored as `application/octet-stream` with metadata including original filename and uploader ID.
