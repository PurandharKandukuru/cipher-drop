/**
 * ProgressBar Component
 * Animated progress indicator for uploads
 */

const ProgressBar = ({
    progress = 0,
    status = 'idle', // 'idle' | 'uploading' | 'encrypting' | 'complete' | 'error'
    showPercentage = true,
    size = 'md',
    className = '',
}) => {
    // Size variants
    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    // Status colors
    const colors = {
        idle: 'bg-text-dim',
        uploading: 'bg-primary',
        encrypting: 'bg-warning',
        complete: 'bg-success',
        error: 'bg-error',
    };

    // Status messages
    const messages = {
        idle: 'Ready to upload',
        uploading: 'Uploading...',
        encrypting: 'Encrypting...',
        complete: 'Complete!',
        error: 'Upload failed',
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Progress bar container */}
            <div className={`w-full bg-surface-hover rounded-full overflow-hidden ${sizes[size]}`}>
                {/* Progress fill */}
                <div
                    className={`
            ${sizes[size]} ${colors[status]} rounded-full
            transition-all duration-300 ease-out
            ${status === 'encrypting' ? 'animate-pulse' : ''}
          `}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {/* Status and percentage */}
            <div className="flex items-center justify-between mt-2">
                <span className={`text-sm ${status === 'error' ? 'text-error' : 'text-text-muted'}`}>
                    {messages[status]}
                </span>
                {showPercentage && status !== 'idle' && (
                    <span className="text-sm font-medium text-text">
                        {Math.round(progress)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProgressBar;
