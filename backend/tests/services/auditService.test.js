/**
 * Audit Service Unit Tests
 */
const crypto = require('crypto');

// Mock Supabase
jest.mock('../config/db', () => ({
    from: jest.fn(() => ({
        insert: jest.fn(() => ({
            select: jest.fn(() => ({
                single: jest.fn(() => ({ data: { id: 'test-id', hash: 'test-hash' }, error: null })),
            })),
        })),
        select: jest.fn(() => ({
            order: jest.fn(() => ({
                limit: jest.fn(() => ({
                    single: jest.fn(() => ({ data: null, error: { code: 'PGRST116' } })),
                })),
            })),
        })),
    })),
}));

// Import after mocking
const AuditService = require('../../services/auditService');

describe('AuditService', () => {
    describe('AuditEventType', () => {
        it('should have all required event types', () => {
            expect(AuditService.AuditEventType.FILE_UPLOAD).toBe('file_upload');
            expect(AuditService.AuditEventType.FILE_DOWNLOAD).toBe('file_download');
            expect(AuditService.AuditEventType.FILE_DELETE).toBe('file_delete');
            expect(AuditService.AuditEventType.SHARE_LINK_CREATE).toBe('share_link_create');
            expect(AuditService.AuditEventType.SHARE_LINK_ACCESS).toBe('share_link_access');
            expect(AuditService.AuditEventType.ACCESS_DENIED).toBe('access_denied');
        });
    });

    describe('logEvent', () => {
        it('should log an event with required fields', async () => {
            const result = await AuditService.logEvent({
                userId: 'user-123',
                fileId: 'file-456',
                eventType: AuditService.AuditEventType.FILE_UPLOAD,
                metadata: { filename: 'test.txt' },
            });

            expect(result).toBeDefined();
        });

        it('should include request metadata when provided', async () => {
            const mockReq = {
                ip: '192.168.1.1',
                headers: { 'user-agent': 'Mozilla/5.0' },
                requestId: 'req-123',
            };

            const result = await AuditService.logEvent({
                userId: 'user-123',
                eventType: AuditService.AuditEventType.AUTH_LOGIN,
                req: mockReq,
            });

            expect(result).toBeDefined();
        });
    });

    describe('convenience methods', () => {
        it('should have logFileUpload method', () => {
            expect(typeof AuditService.logFileUpload).toBe('function');
        });

        it('should have logFileDownload method', () => {
            expect(typeof AuditService.logFileDownload).toBe('function');
        });

        it('should have logAccessDenied method', () => {
            expect(typeof AuditService.logAccessDenied).toBe('function');
        });

        it('should have logShareLinkCreate method', () => {
            expect(typeof AuditService.logShareLinkCreate).toBe('function');
        });
    });

    describe('hash generation', () => {
        it('should generate consistent SHA-256 hashes', () => {
            const data = JSON.stringify({ test: 'data', prevHash: 'GENESIS' });
            const hash = crypto.createHash('sha256').update(data).digest('hex');

            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[a-f0-9]+$/);
        });
    });
});
