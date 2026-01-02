import React from 'react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="text-sm font-medium text-[var(--text-secondary)]"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    id={selectId}
                    className={`
                        w-full h-11 appearance-none rounded-lg border bg-[var(--surface)] px-4 py-2.5 pr-10 text-base
                        transition-all duration-200 ease-out
                        focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:border-[var(--primary)]
                        disabled:opacity-50 disabled:bg-[var(--background)] disabled:cursor-not-allowed
                        ${error ? 'border-[var(--error)] focus:ring-[var(--error)]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'}
                    `}
                    {...props}
                >
                    <option value="" disabled>Select an option</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {error ? (
                <span className="text-xs text-[var(--error)]">{error}</span>
            ) : helperText ? (
                <span className="text-xs text-[var(--text-muted)]">{helperText}</span>
            ) : null}
        </div>
    );
};
