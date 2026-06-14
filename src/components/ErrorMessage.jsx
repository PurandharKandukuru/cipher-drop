/**
 * Error Message Component
 * Friendly error display with icons and retry option
 */
import { AlertCircle, RefreshCw, WifiOff, Lock, FileX, ServerCrash } from 'lucide-react';
import { Button } from './index';

const errorTypes = {
    network: {
        icon: WifiOff,
        title: 'Connection Problem',
        message: 'Please check your internet connection and try again.',
    },
    auth: {
        icon: Lock,
        title: 'Authentication Error',
        message: 'Your session may have expired. Please log in again.',
    },
    notFound: {
        icon: FileX,
        title: 'Not Found',
        message: "The file or page you're looking for doesn't exist.",
    },
    server: {
        icon: ServerCrash,
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
    },
    default: {
        icon: AlertCircle,
        title: 'Error',
        message: 'Something went wrong. Please try again.',
    },
};

const ErrorMessage = ({
    type = 'default',
    title,
    message,
    onRetry,
    className = '',
}) => {
    const errorConfig = errorTypes[type] || errorTypes.default;
    const Icon = errorConfig.icon;

    return (
        <div className={`text-center py-8 px-4 ${className}`}>
            <div className="inline-flex p-4 rounded-full bg-error/10 mb-4">
                <Icon size={32} className="text-error" />
            </div>

            <h3 className="text-lg font-semibold text-text mb-2">
                {title || errorConfig.title}
            </h3>

            <p className="text-text-muted mb-6 max-w-md mx-auto">
                {message || errorConfig.message}
            </p>

            {onRetry && (
                <Button
                    variant="secondary"
                    onClick={onRetry}
                    icon={RefreshCw}
                >
                    Try Again
                </Button>
            )}
        </div>
    );
};

export default ErrorMessage;
