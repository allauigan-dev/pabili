import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    className,
    label
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-10 w-10 border-3',
        xl: 'h-16 w-16 border-4',
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className="relative">
                {/* Outer ring */}
                <div className={cn(
                    "rounded-full border-primary/20",
                    sizeClasses[size]
                )} />
                {/* Spinning part */}
                <div className={cn(
                    "absolute top-0 left-0 rounded-full border-t-primary animate-spin",
                    sizeClasses[size]
                )} />
            </div>
            {label && (
                <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide uppercase text-[10px]">
                    {label}
                </p>
            )}
        </div>
    );
};

// Alternative using Lucide for consistent look with forms
export const Loader: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
    <Loader2 className={cn("animate-spin text-primary", className)} size={size} />
);
