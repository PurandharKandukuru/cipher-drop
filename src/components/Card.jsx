/**
 * Card Component
 * Reusable card container with hover effects and variants
 */

const Card = ({
    children,
    variant = 'default',
    hover = false,
    glow = false,
    padding = 'md',
    className = '',
    onClick,
    ...props
}) => {
    // Padding sizes
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    // Variant styles
    const variants = {
        default: 'bg-surface border border-border',
        elevated: 'bg-surface shadow-card',
        outlined: 'bg-transparent border-2 border-border',
        gradient: 'bg-gradient-to-br from-surface to-background border border-border',
        // Frosted glass: translucent surface + blur so the cosmic background glows through
        glass: 'bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)]',
    };

    return (
        <div
            onClick={onClick}
            className={`
        rounded-xl
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? 'hover:border-primary hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''}
        ${glow ? 'hover:shadow-glow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-300
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
