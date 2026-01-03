import React from 'react';
import { PackageSearch, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    actionLabel,
    onAction,
    icon,
    className,
}) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in-95 duration-500",
            "bg-gradient-to-b from-transparent to-secondary/20 rounded-3xl border border-dashed border-border/60",
            className
        )}>
            <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 shadow-inner">
                {icon || <PackageSearch className="h-10 w-10 opacity-40" />}
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} size="lg" className="shadow-lg shadow-primary/20 gap-2">
                    <Plus className="h-4 w-4" />
                    {actionLabel}
                    <ArrowRight className="h-4 w-4 opacity-50" />
                </Button>
            )}
        </div>
    );
};
