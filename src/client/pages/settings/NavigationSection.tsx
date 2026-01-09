import React from 'react';
import { Lock, RotateCcw, GripVertical } from 'lucide-react';
import { useNavConfig } from '@/hooks/useNavConfig';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
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

interface NavItemData {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    required?: boolean;
}

interface SortableNavItemProps {
    item: NavItemData;
    position: number;
    onToggle: () => void;
}

const SortableNavItem: React.FC<SortableNavItemProps> = ({ item, position, onToggle }) => {
    const isRequired = item.required;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        disabled: isRequired, // Dashboard cannot be dragged
    });

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
                "flex items-center gap-3 p-3 rounded-xl border transition-colors h-[60px]",
                "border-primary/30 bg-primary/5",
                isDragging && "shadow-lg cursor-grabbing",
                !isRequired && !isDragging && "cursor-grab"
            )}
            {...(!isRequired ? { ...attributes, ...listeners } : {})}
        >
            {/* Drag Handle */}
            <div className={cn(
                "flex items-center justify-center",
                isRequired ? "text-muted-foreground/30" : "text-muted-foreground"
            )}>
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Position indicator */}
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{position}</span>
            </div>

            {/* Icon */}
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary text-primary-foreground shrink-0">
                <item.icon className="h-4 w-4" />
            </div>

            {/* Label */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                    {item.label}
                </span>
                {isRequired && (
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
            </div>

            {/* Toggle (only for non-required) */}
            {!isRequired && (
                <Switch
                    checked={true}
                    onCheckedChange={onToggle}
                    onPointerDown={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
};

export const NavigationSection: React.FC = () => {
    const {
        allNavItems,
        enabledItems,
        isItemEnabled,
        toggleItem,
        resetToDefaults,
        canAddMore,
        maxItems,
    } = useNavConfig();

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
            const oldIndex = enabledItems.findIndex((item) => item.id === active.id);
            const newIndex = enabledItems.findIndex((item) => item.id === over.id);

            // Prevent moving to position 0 (reserved for Dashboard)
            if (newIndex === 0) {
                return;
            }

            const newOrder = arrayMove(enabledItems, oldIndex, newIndex);
            const newIds = newOrder.map((item) => item.id);

            // Update localStorage
            localStorage.setItem('pabili-nav-items', JSON.stringify(newIds));
            // Dispatch sync event
            window.dispatchEvent(new CustomEvent('pabili-storage-sync', {
                detail: { key: 'pabili-nav-items', value: newIds }
            }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Bottom Navigation */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Bottom Navigation</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Drag to reorder • Choose up to {maxItems} items
                    </p>
                </div>


                {/* Active Navigation Items (draggable) */}
                <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Active Items
                    </p>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    >
                        <SortableContext
                            items={enabledItems.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {enabledItems.map((item, index) => (
                                    <SortableNavItem
                                        key={item.id}
                                        item={item}
                                        position={index + 1}
                                        onToggle={() => toggleItem(item.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Inactive Navigation Items */}
                {allNavItems.filter(item => !isItemEnabled(item.id)).length > 0 && (
                    <div className="space-y-2 pt-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Available Items
                        </p>
                        {allNavItems.filter(item => !isItemEnabled(item.id)).map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                    canAddMore
                                        ? "border-border/50 bg-muted/30"
                                        : "border-border/50 bg-muted/30 opacity-50"
                                )}
                            >
                                {/* Placeholder for alignment */}
                                <div className="w-4 text-muted-foreground/30">
                                    <GripVertical className="h-4 w-4" />
                                </div>

                                {/* Position placeholder */}
                                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <span className="text-xs text-muted-foreground">—</span>
                                </div>

                                {/* Icon */}
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted text-muted-foreground shrink-0">
                                    <item.icon className="h-4 w-4" />
                                </div>

                                {/* Label */}
                                <span className="flex-1 text-sm font-medium text-muted-foreground truncate">
                                    {item.label}
                                </span>

                                {/* Toggle */}
                                <Switch
                                    checked={false}
                                    onCheckedChange={() => toggleItem(item.id)}
                                    disabled={!canAddMore}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {!canAddMore && (
                    <p className="text-xs text-muted-foreground text-center italic">
                        Maximum {maxItems} items reached. Disable an item to add another.
                    </p>
                )}
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetToDefaults}
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                </Button>
            </div>
        </div>
    );
};
