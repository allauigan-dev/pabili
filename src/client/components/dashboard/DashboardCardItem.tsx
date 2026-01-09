import React from 'react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { DashboardCard } from '@/hooks/useDashboardCards';
import type { DashboardStats } from '@/lib/api';

interface DashboardCardItemProps {
    card: DashboardCard;
    stats: DashboardStats | undefined;
    compact?: boolean; // Smaller card when many are visible
}

export const DashboardCardItem: React.FC<DashboardCardItemProps> = ({
    card,
    stats,
    compact = false,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    // Get the value from stats
    const getValue = (): string | number => {
        if (!stats) return '—';
        const value = stats[card.statKey as keyof DashboardStats];

        // Format revenue as currency
        if (card.statKey === 'revenue' && typeof value === 'number') {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        }

        return value ?? 0;
    };

    const Icon = card.icon;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "bg-gradient-to-br rounded-3xl shadow-lg border-none flex flex-col justify-between relative overflow-hidden group transition-all touch-none",
                card.gradient,
                isDragging && "opacity-90 shadow-2xl scale-105 cursor-grabbing",
                !isDragging && "cursor-grab hover:shadow-xl hover:-translate-y-1",
                // Dynamic sizing based on compact mode
                compact
                    ? "p-3 sm:p-4 h-28 sm:h-32"
                    : "p-4 sm:p-6 h-36 sm:h-44"
            )}
            {...attributes}
            {...listeners}
        >
            {/* Drag grip indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
                <GripVertical className="h-4 w-4 text-white/70" />
            </div>

            <div className="flex justify-between items-start z-10">
                <span className={cn(
                    "font-bold uppercase tracking-widest",
                    card.textColor,
                    compact ? "text-[8px] sm:text-[10px]" : "text-[10px] sm:text-xs"
                )}>
                    {card.label}
                </span>
                <div className={cn(
                    "rounded-2xl text-white flex items-center justify-center shadow-inner backdrop-blur-md border border-white/10",
                    card.iconBg,
                    compact ? "w-8 h-8" : "w-10 h-10"
                )}>
                    <Icon className={cn(
                        compact ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6"
                    )} />
                </div>
            </div>

            <div className="z-10 text-white">
                <span className={cn(
                    "font-bold tracking-tight drop-shadow-sm",
                    compact
                        ? (card.statKey === 'revenue' ? "text-base sm:text-lg" : "text-2xl sm:text-3xl")
                        : (card.statKey === 'revenue' ? "text-xl sm:text-2xl lg:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl")
                )}>
                    {getValue()}
                </span>
            </div>
        </div>
    );
};

