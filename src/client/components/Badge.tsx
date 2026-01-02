import React from 'react';

export interface BadgeProps {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'neutral';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'neutral',
    children,
    className = ''
}) => {
    const variants = {
        primary: 'bg-[var(--primary-light)] text-[var(--primary)]',
        secondary: 'bg-[var(--surface-hover)] text-[var(--text-secondary)]',
        success: 'bg-[var(--success-light)] text-[var(--success)]',
        warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
        error: 'bg-[var(--error-light)] text-[var(--error)]',
        neutral: 'bg-[var(--surface-hover)] text-[var(--text-secondary)]',
        outline: 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)]',
    };

    return (
        <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${variants[variant]}
            ${className}
        `}>
            {children}
        </span>
    );
};
