/**
 * Input Component
 * Reusable input field with icon support and validation states
 */
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = ({
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    error,
    success,
    helperText,
    icon: Icon,
    disabled = false,
    required = false,
    id,
    name,
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Determine border color based on state
    const getBorderColor = () => {
        if (error) return 'border-error focus:border-error focus:ring-error/20';
        if (success) return 'border-success focus:border-success focus:ring-success/20';
        return 'border-border focus:border-primary focus:ring-primary/20';
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-text mb-2"
                >
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </label>
            )}

            {/* Input wrapper */}
            <div className="relative">
                {/* Left icon */}
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                        <Icon size={18} />
                    </div>
                )}

                {/* Input field */}
                <input
                    type={inputType}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            w-full px-4 py-3 rounded-lg
            bg-surface text-text placeholder-text-dim
            border ${getBorderColor()}
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
          `}
                    {...props}
                />

                {/* Password toggle */}
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}

                {/* Status icons */}
                {error && type !== 'password' && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-error" size={18} />
                )}
                {success && type !== 'password' && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-success" size={18} />
                )}
            </div>

            {/* Helper text / Error message */}
            {(helperText || error) && (
                <p className={`mt-2 text-sm ${error ? 'text-error' : 'text-text-muted'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default Input;
