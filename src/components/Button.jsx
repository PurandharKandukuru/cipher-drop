/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    type = 'button',
    onClick,
    className = '',
    ...props
}) => {
    // Base styles
    const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    // Variant styles
    const variants = {
        primary: `
      bg-primary text-white hover:bg-primary-hover
      focus:ring-primary shadow-lg hover:shadow-glow
    `,
        secondary: `
      bg-surface text-text border border-border
      hover:bg-surface-hover hover:border-primary
      focus:ring-primary
    `,
        outline: `
      bg-transparent text-primary border-2 border-primary
      hover:bg-primary hover:text-white
      focus:ring-primary
    `,
        ghost: `
      bg-transparent text-text-muted
      hover:bg-surface hover:text-text
      focus:ring-primary
    `,
        danger: `
      bg-error text-white hover:bg-red-600
      focus:ring-error
    `,
    };

    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
        xl: 'px-8 py-4 text-lg gap-3',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            ) : (
                Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            )}
            {children}
            {!loading && Icon && iconPosition === 'right' && (
                <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            )}
        </button>
    );
};

export default Button;
