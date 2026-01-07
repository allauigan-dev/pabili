import React, { useState } from 'react';
import { Lock, RotateCcw, Smartphone, GripVertical } from 'lucide-react';
import { useNavConfig } from '@/hooks/useNavConfig';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export const NavigationSection: React.FC = () => {
    const {
        allNavItems,
        enabledItems,
        enabledIds,
        isItemEnabled,
        toggleItem,
        resetToDefaults,
        bottomNavItems,
        canAddMore,
        maxItems,
    } = useNavConfig();

    // Drag state
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dragOverItem, setDragOverItem] = useState<string | null>(null);

    // Get the setEnabledIds from localStorage directly for reordering
    const reorderItems = (draggedId: string, targetId: string) => {
        if (draggedId === targetId) return;

        const dragIdx = enabledIds.indexOf(draggedId);
        const targetIdx = enabledIds.indexOf(targetId);

        if (dragIdx === -1 || targetIdx === -1) return;

        // Don't allow moving Dashboard (index 0)
        if (dragIdx === 0 || targetIdx === 0) return;

        const newOrder = [...enabledIds];
        newOrder.splice(dragIdx, 1);
        newOrder.splice(targetIdx, 0, draggedId);

        // Update localStorage directly
        localStorage.setItem('pabili-nav-items', JSON.stringify(newOrder));
        // Dispatch sync event
        window.dispatchEvent(new CustomEvent('pabili-storage-sync', {
            detail: { key: 'pabili-nav-items', value: newOrder }
        }));
    };

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        // Prevent dragging Dashboard
        if (itemId === 'dashboard') {
            e.preventDefault();
            return;
        }
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e: React.DragEvent, itemId: string) => {
        e.preventDefault();
        if (itemId === 'dashboard') return;
        if (draggedItem && itemId !== draggedItem) {
            setDragOverItem(itemId);
        }
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (draggedItem && targetId !== 'dashboard') {
            reorderItems(draggedItem, targetId);
        }
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
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

                {/* Preview */}
                <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Preview</span>
                    </div>
                    <div className="flex justify-around items-center h-12 bg-card rounded-lg border border-border/50">
                        {bottomNavItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col items-center gap-0.5"
                            >
                                <item.icon className="h-4 w-4 text-primary" />
                                <span className="text-[8px] text-muted-foreground uppercase">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                        <div className="flex flex-col items-center gap-0.5">
                            <div className="h-4 w-4 flex items-center justify-center">
                                <span className="text-muted-foreground">•••</span>
                            </div>
                            <span className="text-[8px] text-muted-foreground uppercase">More</span>
                        </div>
                    </div>
                </div>

                {/* Active Navigation Items (draggable) */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Active Items
                    </p>
                    {enabledItems.map((item, index) => {
                        const isRequired = item.required;
                        const isDragging = draggedItem === item.id;
                        const isDragOver = dragOverItem === item.id;

                        return (
                            <div
                                key={item.id}
                                draggable={!isRequired}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, item.id)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                    "border-primary/30 bg-primary/5",
                                    isDragging && "opacity-50 scale-95",
                                    isDragOver && "border-primary border-2 bg-primary/10",
                                    !isRequired && "cursor-grab active:cursor-grabbing"
                                )}
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
                                    <span className="text-xs font-bold text-primary">{index + 1}</span>
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
                                        onCheckedChange={() => toggleItem(item.id)}
                                    />
                                )}
                            </div>
                        );
                    })}
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
