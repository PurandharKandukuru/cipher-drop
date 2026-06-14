/**
 * Share Link Page - Connected to Backend
 */
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Link2, Copy, Check, Lock, Clock, Shield, Mail, ArrowLeft, Download } from 'lucide-react';
import { Button, Card } from '../components';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../services/api';

const ShareLinkPage = () => {
    const { fileId } = useParams();
    const { user, logout } = useAuth();
    const [copied, setCopied] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const shareLink = `${window.location.origin}/download/${fileId}`;

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const response = await filesAPI.getFileMetadata(fileId);
                setFileData(response.data);
            } catch (err) {
                setError(err.message || 'Failed to load file');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFile();
    }, [fileId]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent(`Secure file shared: ${fileData?.originalFilename || 'File'}`);
        const body = encodeURIComponent(
            `I've shared a file with you securely.\n\nFile: ${fileData?.originalFilename}\nDownload link: ${shareLink}\n\n` +
            `${fileData?.isPasswordProtected ? 'This file is password protected. I will send you the password separately.\n\n' : ''}`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getExpiryDisplay = (dateString) => {
        if (!dateString) return { text: 'Never', color: 'text-success', subtext: 'Link never expires' };

        const expiry = new Date(dateString);
        const now = new Date();
        const diffMs = expiry - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: 'Expired', color: 'text-error', subtext: `Expired on ${formatDate(dateString)}` };
        } else if (diffDays === 0) {
            return { text: 'Today', color: 'text-warning', subtext: 'Expires today!' };
        } else if (diffDays === 1) {
            return { text: '1 day', color: 'text-warning', subtext: 'Expires tomorrow' };
        } else if (diffDays <= 7) {
            return { text: `${diffDays} days`, color: 'text-primary', subtext: formatDate(dateString) };
        } else {
            return { text: formatDate(dateString), color: 'text-primary', subtext: `${diffDays} days remaining` };
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout user={user} onLogout={logout}>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout user={user} onLogout={logout}>
                <div className="max-w-2xl mx-auto text-center py-16">
                    <p className="text-error mb-4">{error}</p>
                    <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user} onLogout={logout}>
            <div className="max-w-2xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6">
                    <ArrowLeft size={18} /><span>Back to Dashboard</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-full bg-success/10 mb-4">
                        <Check size={32} className="text-success" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">File Ready to Share!</h1>
                    <p className="text-text-muted">Your file has been encrypted and uploaded securely</p>
                </div>

                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Link2 className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-text">Secure Download Link</h2>
                            <p className="text-sm text-text-muted">{fileData?.originalFilename}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-4 py-3 rounded-lg bg-surface border border-border text-text font-mono text-sm"
                        />
                        <Button onClick={handleCopy} variant={copied ? 'primary' : 'secondary'} icon={copied ? Check : Copy} className="min-w-[120px]">
                            {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                        <Button variant="outline" icon={Mail} onClick={handleEmailShare}>Share via Email</Button>
                    </div>
                </Card>

                <Card className="mb-6">
                    <h3 className="font-semibold text-text mb-4">Link Details</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <div className="flex items-center gap-3">
                                <Lock size={18} className="text-text-muted" />
                                <span className="text-text">Password Protected</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${fileData?.isPasswordProtected ? 'bg-success/10 text-success' : 'bg-surface-hover text-text-muted'}`}>
                                {fileData?.isPasswordProtected ? 'Yes' : 'No'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-text-muted" />
                                <div>
                                    <span className="text-text">Link Expires</span>
                                    {getExpiryDisplay(fileData?.expiry).subtext && (
                                        <p className="text-xs text-text-dim">{getExpiryDisplay(fileData?.expiry).subtext}</p>
                                    )}
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExpiryDisplay(fileData?.expiry).color} ${fileData?.expiry ? 'bg-primary/10' : 'bg-success/10'}`}>
                                {getExpiryDisplay(fileData?.expiry).text}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Download size={18} className="text-text-muted" />
                                <span className="text-text">Download Limit</span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-surface-hover text-text-muted">
                                {fileData?.downloadsLeft === -1 ? 'Unlimited' : `${fileData?.downloadsLeft} remaining`}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card variant="outlined" className="bg-primary/5 border-primary/20">
                    <div className="flex items-start gap-4">
                        <Shield className="text-primary flex-shrink-0" size={24} />
                        <div>
                            <h4 className="font-medium text-text mb-2">Security Tips</h4>
                            <ul className="space-y-1 text-sm text-text-muted">
                                <li>• Share the password through a different channel (e.g., SMS, call)</li>
                                <li>• You can delete the file anytime from your dashboard</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link to="/upload" className="flex-1"><Button variant="secondary" fullWidth>Upload Another</Button></Link>
                    <Link to="/dashboard" className="flex-1"><Button fullWidth>Go to Dashboard</Button></Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ShareLinkPage;
