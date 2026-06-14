/**
 * Access Denied Component
 * Displays explicit error states for access failures
 */
import { ShieldX, Lock, Clock, Download, AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

const errorTypes = {
    expired: {
        icon: Clock,
        title: 'File Expired',
        description: 'This file has passed its expiration date and is no longer available.',
        color: '#f59e0b',
    },
    download_limit: {
        icon: Download,
        title: 'Download Limit Reached',
        description: 'This file has reached its maximum number of downloads.',
        color: '#ef4444',
    },
    unauthorized: {
        icon: Lock,
        title: 'Access Denied',
        description: 'You do not have permission to access this file.',
        color: '#ef4444',
    },
    not_found: {
        icon: ShieldX,
        title: 'File Not Found',
        description: 'This file does not exist or has been deleted.',
        color: '#6b7280',
    },
    share_link_invalid: {
        icon: ShieldX,
        title: 'Invalid Share Link',
        description: 'This share link is invalid or has been revoked.',
        color: '#ef4444',
    },
    share_link_expired: {
        icon: Clock,
        title: 'Share Link Expired',
        description: 'This share link has expired and is no longer valid.',
        color: '#f59e0b',
    },
    default: {
        icon: AlertTriangle,
        title: 'Access Error',
        description: 'An error occurred while trying to access this file.',
        color: '#ef4444',
    },
};

const AccessDenied = ({ type = 'default', message, onRetry }) => {
    const error = errorTypes[type] || errorTypes.default;
    const Icon = error.icon;

    return (
        <div className="access-denied">
            <div className="access-denied-icon" style={{ '--error-color': error.color }}>
                <Icon />
            </div>

            <h2 className="access-denied-title">{error.title}</h2>
            <p className="access-denied-description">
                {message || error.description}
            </p>

            <div className="access-denied-actions">
                {onRetry && (
                    <Button variant="secondary" onClick={onRetry}>
                        Try Again
                    </Button>
                )}
                <Link to="/">
                    <Button variant="primary">
                        <Home className="btn-icon" />
                        Go Home
                    </Button>
                </Link>
            </div>

            <div className="access-denied-info">
                <Lock className="info-icon" />
                <span>Your security is our priority</span>
            </div>

            <style>{`
                .access-denied {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 3rem 1.5rem;
                    min-height: 400px;
                }

                .access-denied-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: color-mix(in srgb, var(--error-color) 15%, transparent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    animation: shake 0.5s ease-in-out;
                }

                .access-denied-icon svg {
                    width: 40px;
                    height: 40px;
                    color: var(--error-color);
                }

                .access-denied-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--color-text-primary, #fff);
                    margin-bottom: 0.5rem;
                }

                .access-denied-description {
                    font-size: 1rem;
                    color: var(--color-text-secondary, #94a3b8);
                    max-width: 400px;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .access-denied-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .btn-icon {
                    width: 18px;
                    height: 18px;
                    margin-right: 0.5rem;
                }

                .access-denied-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 2rem;
                    padding: 0.75rem 1rem;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--color-text-secondary, #94a3b8);
                }

                .info-icon {
                    width: 16px;
                    height: 16px;
                    color: var(--color-primary, #3b82f6);
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                }
            `}</style>
        </div>
    );
};

export default AccessDenied;
