import React, { useRef, useEffect } from 'react';
import { GripVertical, Check } from 'lucide-react';
import { useDashboardActions } from '@/hooks/useDashboardActions';
import { cn } from '@/lib/utils';
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
            scale: 1.05,
            zIndex: 10,
            shadow: 20,
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

export const QuickActionsReorder: React.FC = () => {
    const {
        allActions,
        toggleAction,
        isActionVisible,
        updateOrder,
    } = useDashboardActions();

    const order = useRef<number[]>(allActions.map((_, index) => index));
    const [springs, api] = useSprings(allActions.length, fn(order.current));

    // Update order ref when allActions change
    useEffect(() => {
        order.current = allActions.map((_, index) => index);
        api.start(fn(order.current));
    }, [allActions.length, api]);

    const bind = useDrag(({ args: [originalIndex], active, movement: [, my], first, memo }) => {
        const index = originalIndex as number;
        const curIndex = order.current.indexOf(index);

        // On first drag, store the starting order (memo is typed as unknown, so we cast it)
        const startOrder: number[] = first ? [...order.current] : ((memo as number[] | undefined) || order.current);

        // Calculate which position the dragged item should be at based on movement
        const currentPosition = curIndex * ITEM_HEIGHT + my;
        const targetRow = Math.round(currentPosition / ITEM_HEIGHT);
        const clampedRow = Math.max(0, Math.min(allActions.length - 1, targetRow));

        // Create new order by moving the item
        const newOrder = move(startOrder, startOrder.indexOf(index), clampedRow);

        // Update springs - pass the original start order for position calculation during drag
        api.start(fn(active ? startOrder : newOrder, active, index, my));

        if (!active) {
            order.current = newOrder;
            // Map indexes back to IDs for persistence
            const newIds = newOrder.map(idx => allActions[idx]?.id).filter(Boolean) as string[];
            updateOrder(newIds);
        }

        // Return memo for next frame
        return startOrder;
    }, {
        axis: 'y',
        filterTaps: true,
        rubberband: 0.15,
    });

    return (
        <div className="space-y-3 pb-2 pt-2">
            <div className="relative" style={{ height: allActions.length * 64 }}>
                {springs.map(({ zIndex, shadow, y, scale }, i) => {
                    const action = allActions[i];
                    if (!action) return null;
                    const isVisible = isActionVisible(action.id);

                    return (
                        <animated.div
                            key={action.id}
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
                                "flex items-center justify-between p-3 rounded-xl border h-[60px] cursor-grab active:cursor-grabbing group transition-[background-color,border-color,opacity]",
                                isVisible
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-border/50 bg-muted/30 opacity-60"
                            )}
                            {...bind(i)}
                        >
                            <div className="flex items-center gap-4">
                                {/* Drag Handle */}
                                <div className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                                    <GripVertical className="h-4 w-4" />
                                </div>

                                {/* Icon */}
                                <div className={cn(
                                    "p-2 rounded-lg flex items-center justify-center shrink-0",
                                    action.bg,
                                    action.color
                                )}>
                                    <action.icon className="h-4 w-4" />
                                </div>

                                {/* Label */}
                                <span className="font-bold text-base text-foreground">
                                    {action.label}
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
                                    e.stopPropagation(); // Don't trigger drag
                                    toggleAction(action.id);
                                }}
                            >
                                {isVisible && (
                                    <Check className="h-3.5 w-3.5 text-white" />
                                )}
                            </div>
                        </animated.div>
                    );
                })}
            </div>
        </div>
    );
};
