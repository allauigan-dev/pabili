import React from 'react';
import { GripVertical, Check } from 'lucide-react';
import { useDashboardCards } from '@/hooks/useDashboardCards';
import { cn } from '@/lib/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

interface SortableCardItemProps {
    card: {
        id: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        gradient: string;
        textColor: string;
    };
    isVisible: boolean;
    onToggle: () => void;
}

const SortableCardItem: React.FC<SortableCardItemProps> = ({ card, isVisible, onToggle }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.9 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center justify-between p-3 rounded-xl border h-[60px] group transition-[background-color,border-color,opacity]",
                isVisible
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-muted/30 opacity-60",
                isDragging && "shadow-lg cursor-grabbing",
                !isDragging && "cursor-grab"
            )}
            {...attributes}
            {...listeners}
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Icon with gradient preview */}
                <div className={cn(
                    "p-2 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br",
                    card.gradient,
                    "text-white"
                )}>
                    <card.icon className="h-4 w-4" />
                </div>

                {/* Label */}
                <span className="font-bold text-base text-foreground">
                    {card.label}
                </span>
            </div>

            {/* Visibility Toggle */}
            <div
                className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
                    isVisible
                        ? "bg-primary border-primary scale-110 shadow-sm"
                        : "border-muted-foreground/30 hover:border-primary/50"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                onPointerDown={(e) => e.stopPropagation()}
            >
                {isVisible && (
                    <Check className="h-3.5 w-3.5 text-white" />
                )}
            </div>
        </div>
    );
};

export const DashboardCardsReorder: React.FC = () => {
    const {
        allCards,
        toggleCard,
        isCardVisible,
        updateOrder,
    } = useDashboardCards();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = allCards.findIndex((c) => c.id === active.id);
            const newIndex = allCards.findIndex((c) => c.id === over.id);

            const newOrder = arrayMove(allCards, oldIndex, newIndex);
            const newIds = newOrder.map((c) => c.id);
            updateOrder(newIds);
        }
    };

    return (
        <div className="space-y-3 pb-2 pt-2">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext
                    items={allCards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-1">
                        {allCards.map((card) => (
                            <SortableCardItem
                                key={card.id}
                                card={card}
                                isVisible={isCardVisible(card.id)}
                                onToggle={() => toggleCard(card.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
