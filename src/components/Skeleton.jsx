/**
 * Skeleton Loading Component
 * Animated placeholder for loading states
 */

const Skeleton = ({
    className = '',
    variant = 'text',
    width,
    height,
    rounded = 'md'
}) => {
    const baseClasses = 'animate-pulse bg-surface-hover';

    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
    };

    const variantClasses = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'h-10 w-10 rounded-full',
        thumbnail: 'h-24 w-24 rounded-lg',
        button: 'h-10 w-24 rounded-lg',
        card: 'h-32 w-full rounded-xl',
        circle: 'rounded-full'
    };

    const style = {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${roundedClasses[rounded]} ${className}`}
            style={style}
        />
    );
};

// Skeleton group for file cards
export const FileCardSkeleton = () => (
    <div className="p-4 rounded-xl bg-surface border border-border">
        <div className="flex items-start gap-3">
            <Skeleton variant="thumbnail" width={48} height={48} />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" height={12} />
            </div>
        </div>
        <div className="flex gap-2 mt-4">
            <Skeleton variant="button" width={80} />
            <Skeleton variant="button" width={60} />
        </div>
    </div>
);

// Skeleton for stat cards
export const StatCardSkeleton = () => (
    <div className="p-4 rounded-xl bg-surface border border-border">
        <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
                <Skeleton variant="text" width="60%" height={14} />
                <Skeleton variant="title" width="50%" height={28} />
                <Skeleton variant="text" width="40%" height={12} />
            </div>
            <Skeleton variant="circle" width={40} height={40} />
        </div>
    </div>
);

// Dashboard skeleton layout
export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>

        {/* Storage */}
        <Skeleton variant="card" height={120} />

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton variant="card" height={300} className="lg:col-span-2" />
            <Skeleton variant="card" height={300} />
        </div>

        {/* File list */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <FileCardSkeleton key={i} />)}
        </div>
    </div>
);

export default Skeleton;
