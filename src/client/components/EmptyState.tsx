import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon = '🔍',
    actionLabel,
    onAction
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-[var(--text-secondary)] max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button variant="primary" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
