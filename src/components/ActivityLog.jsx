/**
 * Activity Log Component
 * Displays user file activity timeline
 */
import { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Share2, Trash2, Clock, FileText, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, FileIcon } from './index';
import { filesAPI } from '../services/api';

const activityIcons = {
    upload: { icon: Upload, color: 'text-success', bg: 'bg-success/10' },
    download: { icon: Download, color: 'text-primary', bg: 'bg-primary/10' },
    share: { icon: Share2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    delete: { icon: Trash2, color: 'text-error', bg: 'bg-error/10' },
    view: { icon: FileText, color: 'text-warning', bg: 'bg-warning/10' }
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const ActivityItem = ({ activity }) => {
    const config = activityIcons[activity.type] || activityIcons.view;
    const Icon = config.icon;

    const getActionText = () => {
        switch (activity.type) {
            case 'upload': return 'Uploaded';
            case 'download': return 'Downloaded';
            case 'share': return 'Shared';
            case 'delete': return 'Deleted';
            default: return 'Viewed';
        }
    };

    return (
        <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
            <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon size={16} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-text">
                    <span className="font-medium">{getActionText()}</span>{' '}
                    <span className="text-text-muted truncate">{activity.fileName}</span>
                </p>
                <p className="text-xs text-text-dim flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {formatTimeAgo(activity.createdAt)}
                </p>
            </div>
        </div>
    );
};

const ActivityLog = ({ limit = 10, className = '' }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchActivity = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await filesAPI.getActivity(limit);
            setActivities(response.data?.activities || []);
        } catch (err) {
            setError('Failed to load activity');
            console.error('Activity error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity]);

    if (isLoading) {
        return (
            <Card variant="glass" className={className}>
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-primary" />
                    <h3 className="font-semibold text-text">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 py-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-hover animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-surface-hover rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-surface-hover rounded animate-pulse w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card variant="glass" className={className}>
            <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-primary" />
                <h3 className="font-semibold text-text">Recent Activity</h3>
            </div>

            {error ? (
                <div className="text-center py-8">
                    <div className="inline-flex p-3 rounded-full bg-error/10 mb-3">
                        <AlertCircle size={24} className="text-error" />
                    </div>
                    <p className="text-text font-medium text-sm mb-1">{error}</p>
                    <p className="text-text-dim text-xs mb-4">We couldn't reach the server</p>
                    <button
                        onClick={fetchActivity}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-hover border border-border text-text-muted hover:text-text hover:border-primary/50 transition-colors text-sm"
                    >
                        <RefreshCw size={14} />
                        Retry
                    </button>
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-8">
                    <Activity size={32} className="text-text-dim mx-auto mb-2" />
                    <p className="text-text-muted">No activity yet</p>
                    <p className="text-text-dim text-sm">Upload your first file to get started</p>
                </div>
            ) : (
                <div>
                    {activities.map((activity, index) => (
                        <ActivityItem key={activity.id || index} activity={activity} />
                    ))}
                </div>
            )}
        </Card>
    );
};

export default ActivityLog;
