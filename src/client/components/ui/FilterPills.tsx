import React from 'react';
import { cn } from '@/lib/utils';

interface FilterOption {
    label: string;
    value: string;
    count?: number;
}

interface FilterPillsProps {
    options: FilterOption[];
    activeValue: string;
    onChange: (value: string) => void;
    idPrefix?: string;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
    options,
    activeValue,
    onChange,
    idPrefix = 'filter'
}) => {
    return (
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
            {options.map((option) => {
                const isActive = activeValue === option.value;
                return (
                    <button
                        key={option.value}
                        id={`${idPrefix}-${option.value}`}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border",
                            isActive
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        )}
                    >
                        <span className="capitalize">{option.label}</span>
                        {option.count !== undefined && (
                            <span className={cn(
                                "text-[9px] px-1 py-0.5 rounded-full min-w-[16px] text-center",
                                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                {option.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
