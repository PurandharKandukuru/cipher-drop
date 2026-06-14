/**
 * Storage Usage Component
 * Displays storage usage with animated progress bar
 */
import { HardDrive, TrendingUp } from 'lucide-react';
import { Card } from './index';

const StorageUsage = ({ used = 0, limit = 1024 * 1024 * 1024, unlimited = false }) => {
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const percentage = unlimited ? Math.min((used / (1024 * 1024 * 1024)) * 100, 100) : (used / limit) * 100;
    const displayPercentage = Math.min(percentage, 100).toFixed(1);

    // Determine color based on usage
    const getColor = () => {
        if (unlimited) return 'primary';
        if (percentage > 90) return 'error';
        if (percentage > 70) return 'warning';
        return 'primary';
    };

    const color = getColor();

    const colorClasses = {
        primary: 'bg-primary',
        warning: 'bg-warning',
        error: 'bg-error'
    };


    return (
        <Card variant="glass" className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#A855F7]/15 rounded-full blur-3xl transform translate-x-8 -translate-y-8" />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <HardDrive size={22} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-text">Storage</h3>
                            <p className="text-xs text-text-muted">
                                {unlimited ? 'Free Plan' : 'Premium Plan'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-success text-xs">
                            <TrendingUp size={12} />
                            <span>Safe</span>
                        </div>
                    </div>
                </div>

                {/* Usage stats */}
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-text">{formatSize(used)}</span>
                    <span className="text-text-muted text-sm">
                        / {unlimited ? '∞ Unlimited' : formatSize(limit)}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-surface-hover rounded-full overflow-hidden">
                    <div
                        className={`absolute left-0 top-0 h-full rounded-full ${colorClasses[color]}`}
                        style={{ width: `${Math.min(displayPercentage, 100)}%` }}
                    />
                </div>

                {/* Percentage */}
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-text-muted">
                        {unlimited ? 'Using free storage' : `${displayPercentage}% used`}
                    </span>
                    <span className={`text-xs font-medium ${percentage > 90 ? 'text-error' : 'text-text-dim'}`}>
                        {unlimited ? formatSize(used) : formatSize(limit - used) + ' available'}
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default StorageUsage;
