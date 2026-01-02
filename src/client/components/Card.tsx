import React from 'react';

interface CardProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    extra?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    extra,
    footer,
    children,
    className = '',
    onClick
}) => {
    return (
        <div
            className={`
                bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden
                ${onClick ? 'cursor-pointer hover:border-[var(--border-hover)] hover:shadow-md transition-all duration-200' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {(title || extra) && (
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>}
                        {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
                    </div>
                    {extra && <div className="flex items-center">{extra}</div>}
                </div>
            )}

            <div className="p-4">
                {children}
            </div>

            {footer && (
                <div className="px-4 py-3 bg-[var(--background)] border-t border-[var(--border)]">
                    {footer}
                </div>
            )}
        </div>
    );
};
