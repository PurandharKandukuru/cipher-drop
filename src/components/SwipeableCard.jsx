/**
 * Swipeable File Card Component
 * Mobile-friendly card with swipe actions (delete, share)
 */
import { useState, useRef } from 'react';
import { Share2, Trash2, Copy, ExternalLink } from 'lucide-react';

const SwipeableCard = ({
    children,
    onDelete,
    onShare,
    onCopyLink,
    disabled = false,
}) => {
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const startXRef = useRef(0);
    const currentXRef = useRef(0);

    const SWIPE_THRESHOLD = 80;
    const MAX_SWIPE = 160;

    const handleTouchStart = (e) => {
        if (disabled) return;
        startXRef.current = e.touches[0].clientX;
        currentXRef.current = e.touches[0].clientX;
        setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
        if (!isSwiping || disabled) return;
        currentXRef.current = e.touches[0].clientX;
        const diff = startXRef.current - currentXRef.current;

        // Only allow left swipe (negative translateX)
        if (diff > 0) {
            const clampedDiff = Math.min(diff, MAX_SWIPE);
            setTranslateX(-clampedDiff);
        } else {
            setTranslateX(0);
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);

        // Snap to action position or back to start
        if (Math.abs(translateX) > SWIPE_THRESHOLD) {
            setTranslateX(-MAX_SWIPE);
        } else {
            setTranslateX(0);
        }
    };

    const resetSwipe = () => {
        setTranslateX(0);
    };

    const handleAction = (action) => {
        action?.();
        resetSwipe();
    };

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Background actions (revealed on swipe) */}
            <div className="absolute inset-y-0 right-0 flex items-stretch">
                {onCopyLink && (
                    <button
                        onClick={() => handleAction(onCopyLink)}
                        className="w-16 bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                    >
                        <Copy size={20} />
                    </button>
                )}
                {onShare && (
                    <button
                        onClick={() => handleAction(onShare)}
                        className="w-16 bg-purple-500 flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                    >
                        <Share2 size={20} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => handleAction(onDelete)}
                        className="w-16 bg-error flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            {/* Main content */}
            <div
                className={`relative bg-surface border border-border transition-transform ${isSwiping ? '' : 'duration-200'
                    }`}
                style={{ transform: `translateX(${translateX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>

            {/* Swipe hint on mobile */}
            {translateX !== 0 && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to left, transparent 50%, rgba(0,0,0,0.1))'
                    }}
                />
            )}
        </div>
    );
};

export default SwipeableCard;
