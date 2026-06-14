/**
 * Upload Page - Multi-File Support
 * Secure file upload with client-side encryption and upload queue
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Clock, Upload, AlertTriangle, CheckCircle, Download, X, FileText, Loader2 } from 'lucide-react';
import { Button, Card, Input, FileDropzone, ProgressBar, FileIcon } from '../components';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../services/api';
import { encryptFile } from '../utils/crypto';
import { EventHorizon } from '../components/Hero';

const UploadPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [files, setFiles] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]); // {file, status, progress, fileId, error}
    const [password, setPassword] = useState('');
    const [usePassword, setUsePassword] = useState(false);
    const [expiry, setExpiry] = useState('7');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [downloadLimit, setDownloadLimit] = useState('-1');

    const expiryOptions = [
        { value: '1', label: '1 Day' },
        { value: '7', label: '7 Days' },
        { value: '30', label: '30 Days' },
        { value: 'never', label: 'Never' },
    ];

    const downloadLimitOptions = [
        { value: '1', label: '1 Download' },
        { value: '5', label: '5 Downloads' },
        { value: '10', label: '10 Downloads' },
        { value: '-1', label: 'Unlimited' },
    ];

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileSelect = (selectedFiles) => {
        setFiles(selectedFiles);
        setError('');
    };

    const uploadSingleFile = async (file, index) => {
        // Update queue status
        setUploadQueue(prev => prev.map((item, i) =>
            i === index ? { ...item, status: 'encrypting', progress: 10 } : item
        ));

        try {
            // Encrypt the file
            const { encryptedBlob, metadata } = await encryptFile(
                file,
                usePassword ? password : null
            );

            setUploadQueue(prev => prev.map((item, i) =>
                i === index ? { ...item, status: 'uploading', progress: 50 } : item
            ));

            // Upload to server
            const response = await filesAPI.upload(encryptedBlob, {
                ...metadata,
                expiry: expiry,
                downloadsLimit: parseInt(downloadLimit, 10),
            });

            setUploadQueue(prev => prev.map((item, i) =>
                i === index ? { ...item, status: 'complete', progress: 100, fileId: response.data.fileId } : item
            ));

            return { success: true, fileId: response.data.fileId };
        } catch (err) {
            setUploadQueue(prev => prev.map((item, i) =>
                i === index ? { ...item, status: 'error', error: err.message } : item
            ));
            return { success: false, error: err.message };
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setError('');

        // Initialize upload queue
        const queue = files.map(file => ({
            file,
            status: 'pending',
            progress: 0,
            fileId: null,
            error: null
        }));
        setUploadQueue(queue);

        // Process files sequentially
        for (let i = 0; i < files.length; i++) {
            await uploadSingleFile(files[i], i);
        }

        setIsUploading(false);
    };

    const allComplete = uploadQueue.length > 0 && uploadQueue.every(item => item.status === 'complete');
    const hasErrors = uploadQueue.some(item => item.status === 'error');

    return (
        <DashboardLayout user={user} onLogout={logout}>
            {/* Background Effects */}
            <EventHorizon />

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Upload Files</h1>
                    <p className="text-text-muted">Your files will be encrypted before upload</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error">
                        {error}
                    </div>
                )}

                <Card variant="glass" className="mb-6">
                    <FileDropzone
                        onFileSelect={handleFileSelect}
                        disabled={isUploading}
                        multiple={true}
                        className="mb-6"
                    />

                    {files.length > 0 && !isUploading && uploadQueue.length === 0 && (
                        <div className="space-y-6 pt-6 border-t border-border">
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={usePassword}
                                        onChange={(e) => setUsePassword(e.target.checked)}
                                        className="w-5 h-5 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-0"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Lock size={18} className="text-primary" />
                                        <span className="font-medium text-text">Password Protection</span>
                                    </div>
                                    <span className="text-sm text-text-muted">(Optional)</span>
                                </label>

                                {usePassword && (
                                    <div className="ml-8">
                                        <Input
                                            type="password"
                                            placeholder="Enter a password for these files"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            helperText="Same password will be used for all files"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock size={18} className="text-primary" />
                                    <span className="font-medium text-text">Link Expiry</span>
                                </div>
                                <div className="flex flex-wrap gap-3 ml-6">
                                    {expiryOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setExpiry(option.value)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${expiry === option.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border bg-surface text-text-muted hover:border-primary/50'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Download size={18} className="text-primary" />
                                    <span className="font-medium text-text">Download Limit</span>
                                </div>
                                <div className="flex flex-wrap gap-3 ml-6">
                                    {downloadLimitOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setDownloadLimit(option.value)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${downloadLimit === option.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border bg-surface text-text-muted hover:border-primary/50'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <Button size="lg" fullWidth icon={Upload} onClick={handleUpload}>
                                    Encrypt & Upload {files.length > 1 ? `${files.length} Files` : ''}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Upload Queue */}
                    {uploadQueue.length > 0 && (
                        <div className="pt-6 border-t border-border space-y-3">
                            <h3 className="font-medium text-text mb-4">Upload Progress</h3>
                            {uploadQueue.map((item, index) => (
                                <div key={index} className="p-4 rounded-lg bg-surface border border-border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FileIcon filename={item.file.name} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text truncate">{item.file.name}</p>
                                            <p className="text-xs text-text-muted">{formatFileSize(item.file.size)}</p>
                                        </div>
                                        <div>
                                            {item.status === 'pending' && (
                                                <span className="text-xs text-text-muted">Waiting...</span>
                                            )}
                                            {item.status === 'encrypting' && (
                                                <span className="flex items-center gap-1 text-xs text-primary">
                                                    <Loader2 size={12} className="animate-spin" /> Encrypting
                                                </span>
                                            )}
                                            {item.status === 'uploading' && (
                                                <span className="flex items-center gap-1 text-xs text-primary">
                                                    <Loader2 size={12} className="animate-spin" /> Uploading
                                                </span>
                                            )}
                                            {item.status === 'complete' && (
                                                <CheckCircle size={18} className="text-success" />
                                            )}
                                            {item.status === 'error' && (
                                                <X size={18} className="text-error" />
                                            )}
                                        </div>
                                    </div>
                                    {(item.status === 'encrypting' || item.status === 'uploading') && (
                                        <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    )}
                                    {item.status === 'complete' && item.fileId && (
                                        <Link
                                            to={`/share/${item.fileId}`}
                                            className="text-xs text-primary hover:underline mt-2 inline-block"
                                        >
                                            View Share Link →
                                        </Link>
                                    )}
                                    {item.status === 'error' && (
                                        <p className="text-xs text-error mt-1">{item.error}</p>
                                    )}
                                </div>
                            ))}

                            {allComplete && (
                                <div className="text-center pt-4">
                                    <p className="text-success font-medium mb-4">
                                        <CheckCircle className="inline mr-2" size={18} />
                                        All files uploaded successfully!
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                                            Go to Dashboard
                                        </Button>
                                        <Button onClick={() => { setFiles([]); setUploadQueue([]); }}>
                                            Upload More
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {hasErrors && !isUploading && (
                                <div className="text-center pt-4">
                                    <p className="text-warning font-medium mb-4">
                                        Some files failed to upload
                                    </p>
                                    <Button variant="secondary" onClick={() => { setFiles([]); setUploadQueue([]); }}>
                                        Try Again
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <Card variant="outlined" className="bg-primary/5 border-primary/20">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Shield className="text-primary" size={24} />
                        </div>
                        <div>
                            <h3 className="font-medium text-text mb-2">Your Privacy is Protected</h3>
                            <ul className="space-y-2 text-sm text-text-muted">
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-success" />
                                    Files are encrypted in your browser before upload
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-success" />
                                    We never see your unencrypted files
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-success" />
                                    AES-256 encryption, same as banks use
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>

                <div className="mt-4 flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text">
                        <span className="font-medium">Note:</span> Large files may take longer to encrypt.
                        Please keep this page open during the upload process.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UploadPage;
