/**
 * Confirm Dialog Component
 * Beautiful confirmation dialog with customizable actions
 */
import { AlertTriangle, Trash2, LogOut, X } from 'lucide-react';
import { Button } from './index';

const iconMap = {
    delete: Trash2,
    logout: LogOut,
    warning: AlertTriangle,
};

const colorMap = {
    delete: 'error',
    logout: 'warning',
    warning: 'warning',
    default: 'primary'
};

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning', // 'delete' | 'logout' | 'warning'
    itemName = '',
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const Icon = iconMap[type] || AlertTriangle;
    const color = colorMap[type] || 'primary';

    const colorClasses = {
        error: 'bg-error/10 text-error',
        warning: 'bg-warning/10 text-warning',
        primary: 'bg-primary/10 text-primary',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className={`mx-auto w-14 h-14 rounded-full ${colorClasses[color]} flex items-center justify-center mb-4`}>
                    <Icon size={28} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-text text-center mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-text-muted text-center mb-2">
                    {message}
                </p>

                {/* Item name if provided */}
                {itemName && (
                    <p className="text-center mb-6">
                        <span className="px-3 py-1.5 rounded-lg bg-surface-hover text-text font-mono text-sm">
                            {itemName}
                        </span>
                    </p>
                )}

                {!itemName && <div className="mb-6" />}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={type === 'delete' ? 'danger' : 'primary'}
                        fullWidth
                        onClick={onConfirm}
                        loading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
