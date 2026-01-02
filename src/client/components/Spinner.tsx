import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'white';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    variant = 'primary',
    className = ''
}) => {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    const variants = {
        primary: 'border-[var(--primary)]',
        white: 'border-white',
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className={`
                ${sizes[size]} ${variants[variant]}
                animate-spin border-t-transparent rounded-full
            `} />
        </div>
    );
};
