/**
 * Download Page - Enhanced with Security Features
 * Secure file download with client-side decryption and explicit error states
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Lock, Download, Clock, CheckCircle, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button, Card, Input, FileIcon, AccessDenied } from '../components';
import { Header } from '../layouts';
import { filesAPI } from '../services/api';
import { decryptFile } from '../utils/crypto';

const DownloadPage = () => {
    const { fileId } = useParams();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errorType, setErrorType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await filesAPI.getFileMetadata(fileId);
                setFileData(response.data);
            } catch (err) {
                const message = err.message || 'File not found or expired';
                setError(message);

                // Determine error type for AccessDenied component
                if (message.includes('expired')) {
                    setErrorType('expired');
                } else if (message.includes('Download limit')) {
                    setErrorType('download_limit');
                } else if (message.includes('not found')) {
                    setErrorType('not_found');
                } else if (message.includes('denied') || message.includes('authorized')) {
                    setErrorType('unauthorized');
                } else {
                    setErrorType('default');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchMetadata();
    }, [fileId]);

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatExpiry = (expiryDate) => {
        if (!expiryDate) return 'Never expires';
        const expiry = new Date(expiryDate);
        const now = new Date();
        const diffMs = expiry - now;

        if (diffMs <= 0) return 'Expired';

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) {
            return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        }
        return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    };

    const formatDownloadsLeft = (downloadsLeft) => {
        if (downloadsLeft === -1) return 'Unlimited downloads';
        if (downloadsLeft === 0) return 'No downloads remaining';
        return `${downloadsLeft} download${downloadsLeft > 1 ? 's' : ''} remaining`;
    };

    const handleDownload = async () => {
        if (fileData?.isPasswordProtected && !password) {
            setError('Please enter the password');
            return;
        }

        setError('');
        setIsDecrypting(true);

        try {
            // Download encrypted file
            setIsDownloading(true);
            const encryptedBlob = await filesAPI.downloadFile(fileId);
            setIsDownloading(false);

            // Decrypt client-side
            const decryptedBlob = await decryptFile(
                encryptedBlob,
                fileData,
                fileData?.isPasswordProtected ? password : null
            );

            setIsDecrypting(false);
            setDownloadComplete(true);

            // Trigger browser download
            const url = URL.createObjectURL(decryptedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileData?.originalFilename || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            setIsDecrypting(false);
            setIsDownloading(false);
            setError(err.message || 'Decryption failed. Check your password.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="text-text-muted mt-4">Loading file information...</p>
                </main>
            </div>
        );
    }

    if (error && !fileData) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto">
                        <AccessDenied
                            type={errorType}
                            message={error}
                            onRetry={() => window.location.reload()}
                        />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <main className="relative container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                            <Shield size={32} className="text-primary" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Secure File Download</h1>
                        <p className="text-text-muted">This file is protected with end-to-end encryption</p>
                    </div>

                    <Card className="mb-6">
                        <div className="flex items-start gap-4 mb-6">
                            <FileIcon filename={fileData?.originalFilename} size="lg" />
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-text truncate">{fileData?.originalFilename}</h2>
                                <p className="text-sm text-text-muted mt-1">{formatFileSize(fileData?.fileSize)}</p>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
                                <Lock size={14} />AES-256 Encrypted
                            </span>
                            {fileData?.isPasswordProtected && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                                    <Lock size={14} />Password Protected
                                </span>
                            )}
                        </div>

                        {/* File Status Info */}
                        <div className="mb-6 p-3 rounded-lg bg-surface border border-border space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={14} className="text-text-muted" />
                                <span className="text-text-muted">{formatExpiry(fileData?.expiry)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Download size={14} className="text-text-muted" />
                                <span className="text-text-muted">{formatDownloadsLeft(fileData?.downloadsLeft)}</span>
                            </div>
                            {fileData?.downloadsLeft !== -1 && fileData?.downloadsLeft <= 2 && (
                                <div className="flex items-center gap-2 text-sm text-warning">
                                    <AlertCircle size={14} />
                                    <span>Limited downloads remaining</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                                {error}
                            </div>
                        )}

                        {fileData?.isPasswordProtected && !downloadComplete && (
                            <div className="mb-6">
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        label="Enter Password"
                                        placeholder="Password provided by sender"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        icon={Lock}
                                        disabled={isDecrypting || isDownloading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-9 text-text-muted hover:text-text transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!downloadComplete ? (
                            <Button
                                size="lg"
                                fullWidth
                                icon={isDecrypting || isDownloading ? undefined : Download}
                                onClick={handleDownload}
                                disabled={isDecrypting || isDownloading}
                            >
                                {isDownloading ? (
                                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} />Downloading...</span>
                                ) : isDecrypting ? (
                                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} />Decrypting...</span>
                                ) : (
                                    'Decrypt & Download'
                                )}
                            </Button>
                        ) : (
                            <div className="text-center">
                                <div className="inline-flex p-3 rounded-full bg-success/10 mb-4">
                                    <CheckCircle size={24} className="text-success" />
                                </div>
                                <p className="text-success font-medium mb-4">Download Complete!</p>
                                <Button variant="secondary" fullWidth onClick={() => { setDownloadComplete(false); setPassword(''); }}>
                                    Download Again
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card variant="outlined" className="bg-surface/50">
                        <h3 className="font-medium text-text mb-3 flex items-center gap-2">
                            <Shield size={16} className="text-primary" />Security Information
                        </h3>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
                                <span>File is decrypted in your browser, not on our servers</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
                                <span>We never have access to your decrypted file</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
                                <span>All transfers are secured with HTTPS</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default DownloadPage;

