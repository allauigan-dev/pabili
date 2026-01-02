import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    icon,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-[var(--text-secondary)]"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {icon}
                    </div>
                )}

                <input
                    id={inputId}
                    className={`
                        w-full h-11 rounded-lg border bg-[var(--surface)] px-4 py-2.5 text-base
                        transition-all duration-200 ease-out
                        placeholder:text-[var(--text-muted)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:border-[var(--primary)]
                        disabled:opacity-50 disabled:bg-[var(--background)] disabled:cursor-not-allowed
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-[var(--error)] focus:ring-[var(--error)]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'}
                    `}
                    {...props}
                />
            </div>

            {error ? (
                <span className="text-xs text-[var(--error)]">{error}</span>
            ) : helperText ? (
                <span className="text-xs text-[var(--text-muted)]">{helperText}</span>
            ) : null}
        </div>
    );
};
