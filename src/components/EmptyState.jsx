/**
 * Empty State Component
 * Beautiful empty states with illustrations and actions
 */
import { FileX, Upload, Search, FolderOpen, AlertCircle } from 'lucide-react';
import { Button } from './index';

const illustrations = {
    noFiles: (
        <svg className="w-48 h-48" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" className="fill-surface stroke-border" strokeWidth="2" />
            <path d="M70 90h60v50H70z" className="fill-surface-hover stroke-primary" strokeWidth="2" />
            <path d="M80 90V75c0-5.5 4.5-10 10-10h20c5.5 0 10 4.5 10 10v15" className="stroke-primary" strokeWidth="2" />
            <circle cx="100" cy="115" r="8" className="fill-primary" />
            <path d="M100 123v12" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    noResults: (
        <svg className="w-48 h-48" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" className="fill-surface stroke-border" strokeWidth="2" />
            <circle cx="90" cy="90" r="30" className="stroke-primary" strokeWidth="3" />
            <path d="M112 112l25 25" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
            <path d="M80 85h20M90 75v20" className="stroke-text-dim" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    error: (
        <svg className="w-48 h-48" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" className="fill-surface stroke-border" strokeWidth="2" />
            <circle cx="100" cy="100" r="40" className="fill-error/10 stroke-error" strokeWidth="2" />
            <path d="M100 80v25" className="stroke-error" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="120" r="4" className="fill-error" />
        </svg>
    )
};

const presets = {
    noFiles: {
        illustration: illustrations.noFiles,
        icon: FolderOpen,
        title: 'No files yet',
        description: 'Upload your first file to get started with secure sharing',
        actionLabel: 'Upload File',
        actionIcon: Upload
    },
    noResults: {
        illustration: illustrations.noResults,
        icon: Search,
        title: 'No results found',
        description: 'Try adjusting your search or filters to find what you\'re looking for',
        actionLabel: 'Clear Search'
    },
    error: {
        illustration: illustrations.error,
        icon: AlertCircle,
        title: 'Something went wrong',
        description: 'We encountered an error loading your data. Please try again.',
        actionLabel: 'Retry'
    }
};

const EmptyState = ({
    preset = 'noFiles',
    title,
    description,
    icon: CustomIcon,
    actionLabel,
    actionIcon,
    onAction,
    className = ''
}) => {
    const config = presets[preset] || presets.noFiles;
    const Icon = CustomIcon || config.icon;

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            {/* Illustration */}
            <div className="mb-6 opacity-80">
                {config.illustration}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-text mb-2">
                {title || config.title}
            </h3>

            {/* Description */}
            <p className="text-text-muted max-w-md mb-6">
                {description || config.description}
            </p>

            {/* Action Button */}
            {(actionLabel || config.actionLabel) && onAction && (
                <Button
                    onClick={onAction}
                    icon={actionIcon || config.actionIcon}
                    className="animate-in zoom-in duration-300"
                >
                    {actionLabel || config.actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
