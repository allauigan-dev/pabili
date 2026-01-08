import React, { useRef } from 'react';
import { Lock, RotateCcw, GripVertical } from 'lucide-react';
import { useNavConfig } from '@/hooks/useNavConfig';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useDrag } from '@use-gesture/react';
import { useSprings, animated, config } from '@react-spring/web';

// Helper to move an item in an array
const move = <T,>(array: T[], from: number, to: number) => {
    const newArray = [...array];
    const item = newArray.splice(from, 1)[0];
    newArray.splice(to, 0, item);
    return newArray;
};

// Height of each item row
const ITEM_HEIGHT = 64;

// Helper for spring calculations
const fn = (order: number[], active = false, originalIndex = -1, y = 0) => (index: number) => {
    // For the actively dragged item, calculate position based on original order position + drag offset
    if (active && index === originalIndex) {
        const originalOrderPosition = order.indexOf(index);
        return {
            y: originalOrderPosition * ITEM_HEIGHT + y,
            scale: 1.02,
            zIndex: 1,
            shadow: 15,
            immediate: (key: string) => key === 'y' || key === 'zIndex',
            config: config.stiff,
        };
    }
    // For non-dragged items, animate to their position in the current order
    return {
        y: order.indexOf(index) * ITEM_HEIGHT,
        scale: 1,
        zIndex: 0,
        shadow: 1,
        immediate: false,
        config: config.stiff,
    };
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

    const order = useRef<number[]>(enabledItems.map((_, index) => index));
    const [springs, api] = useSprings(enabledItems.length, fn(order.current));

    // Update order ref when enabledItems change (e.g., item toggled or reset)
    React.useEffect(() => {
        order.current = enabledItems.map((_, index) => index);
        api.start(fn(order.current));
    }, [enabledItems.length, api]);

    const bind = useDrag(({ args: [originalIndex], active, movement: [, my], first, memo }) => {
        const index = originalIndex as number;
        const curIndex = order.current.indexOf(index);

        // On first drag, store the starting order (memo is typed as unknown, so we cast it)
        const startOrder: number[] = first ? [...order.current] : ((memo as number[] | undefined) || order.current);

        // Calculate which position the dragged item should be at based on movement
        const currentPosition = curIndex * ITEM_HEIGHT + my;
        const targetRow = Math.round(currentPosition / ITEM_HEIGHT);
        const clampedRow = Math.max(0, Math.min(enabledItems.length - 1, targetRow));

        // Prevent moving Dashboard (id: 'dashboard', index 0)
        // Check if the item being dragged is Dashboard OR if it's being moved to position 0
        const isDashboardBeingDragged = enabledItems[index]?.id === 'dashboard';
        const isMovingToDashboardPosition = clampedRow === 0 && startOrder.indexOf(index) !== 0;

        if (isDashboardBeingDragged || isMovingToDashboardPosition) {
            // If dragging dashboard or trying to move something to position 0, just animate in place
            api.start(fn(order.current, active, index, my));
            return startOrder;
        }

        // Create new order by moving the item
        const newOrder = move(startOrder, startOrder.indexOf(index), clampedRow);

        // Update springs - pass the original start order for position calculation during drag
        api.start(fn(active ? startOrder : newOrder, active, index, my));

        if (!active) {
            order.current = newOrder;
            // Map indexes back to IDs for localStorage
            const newIds = newOrder.map(idx => enabledItems[idx]?.id).filter(Boolean) as string[];

            // Update localStorage
            localStorage.setItem('pabili-nav-items', JSON.stringify(newIds));
            // Dispatch sync event
            window.dispatchEvent(new CustomEvent('pabili-storage-sync', {
                detail: { key: 'pabili-nav-items', value: newIds }
            }));
        }

        // Return memo for next frame
        return startOrder;
    }, {
        axis: 'y',
        filterTaps: true,
        rubberband: 0.15,
    });

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
                    <div className="relative" style={{ height: enabledItems.length * 64 }}>
                        {springs.map(({ zIndex, shadow, y, scale }, i) => {
                            const item = enabledItems[i];
                            if (!item) return null;
                            const isRequired = item.required;

                            return (
                                <animated.div
                                    key={item.id}
                                    style={{
                                        zIndex,
                                        boxShadow: shadow.to(s => `rgba(0, 0, 0, ${s / 100}) 0px ${s}px ${s * 2}px`),
                                        y,
                                        scale,
                                        position: 'absolute',
                                        width: '100%',
                                        top: 0,
                                        touchAction: 'none',
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-colors h-[60px]",
                                        "border-primary/30 bg-primary/5",
                                        !isRequired && "cursor-grab active:cursor-grabbing"
                                    )}
                                    {...(!isRequired ? bind(i) : {})}
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
                                        <span className="text-xs font-bold text-primary">{order.current.indexOf(i) + 1}</span>
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
                                </animated.div>
                            );
                        })}
                    </div>
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
