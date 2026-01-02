import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
        primary: 'bg-[var(--primary)] text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)] focus:ring-[var(--primary)] shadow-sm hover:shadow',
        secondary: 'bg-[var(--secondary)] text-white hover:bg-[var(--secondary-hover)] focus:ring-[var(--secondary)] shadow-sm',
        success: 'bg-[var(--success)] text-white hover:bg-[var(--success-hover)] focus:ring-[var(--success)] shadow-sm',
        warning: 'bg-[var(--warning)] text-white hover:bg-[var(--warning-hover)] focus:ring-[var(--warning)] shadow-sm',
        error: 'bg-[var(--error)] text-white hover:bg-[var(--error-hover)] focus:ring-[var(--error)] shadow-sm',
        ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus:ring-[var(--border)]',
        outline: 'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] focus:ring-[var(--border)]',
    };

    const sizes = {
        sm: 'h-9 px-3 text-sm gap-1.5',
        md: 'h-11 px-4 text-base gap-2',
        lg: 'h-13 px-6 text-lg gap-2.5',
    };

    const classes = [
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
    ].join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
            ) : (
                <>
                    {icon && <span className="flex items-center">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};
