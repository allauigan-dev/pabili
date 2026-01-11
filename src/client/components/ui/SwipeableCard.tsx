import React, { useRef, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { useSpring, animated, config } from '@react-spring/web';
import { Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom events for card swipe coordination with page navigation
const dispatchCardSwipeStart = () => {
    window.dispatchEvent(new CustomEvent('card-swipe-start'));
};

const dispatchCardSwipeEnd = () => {
    window.dispatchEvent(new CustomEvent('card-swipe-end'));
};

// Threshold configurations
const REVEAL_THRESHOLD = 80;      // Pixels to reveal action
const TRIGGER_THRESHOLD = 120;    // Pixels to trigger action
const CARD_RETURN_VELOCITY = 0.5; // Velocity for rubber-band return

export interface SwipeAction {
    icon: React.ReactNode;
    label: string;
    color: string;
    bgColor: string;
    onAction: () => void;
    disabled?: boolean;
}

interface SwipeableCardProps {
    children: React.ReactNode;
    leftAction?: SwipeAction;
    rightAction?: SwipeAction;
    className?: string;
    disabled?: boolean;
    onSwipeStart?: () => void;
    onSwipeEnd?: () => void;
}

// Percentage of card height at top/bottom where page navigation is allowed
// (e.g., 0.15 = 15% at top and 15% at bottom are "page swipe zones")
const EDGE_ZONE_PERCENT = 0.15;

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
    children,
    leftAction,
    rightAction,
    className,
    disabled = false,
    onSwipeStart,
    onSwipeEnd,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const isCardSwipeActive = useRef(false);
    const isInSwipeZone = useRef(true); // Track if touch started in the middle "swipe zone"

    // Spring for card position
    const [{ x }, api] = useSpring(() => ({
        x: 0,
        config: { ...config.stiff, clamp: true },
    }));

    // Reset card to center
    const resetCard = useCallback(() => {
        api.start({ x: 0, config: config.wobbly });
    }, [api]);

    // Handle action trigger
    const triggerAction = useCallback((action: SwipeAction | undefined, direction: 'left' | 'right') => {
        if (!action || action.disabled) return;

        // Animate card off-screen briefly then return
        const targetX = direction === 'left' ? -300 : 300;

        api.start({
            x: targetX,
            config: { tension: 300, friction: 20 },
            onRest: () => {
                action.onAction();
                // Reset after action
                setTimeout(() => {
                    api.start({ x: 0, config: config.wobbly });
                }, 150);
            },
        });
    }, [api]);

    const bind = useDrag(
        ({ active, movement: [mx], velocity: [vx], cancel, first, last, xy }) => {
            // Disabled check
            if (disabled) {
                if (cancel) cancel();
                return;
            }

            // On first touch, determine if we're in the card's swipe zone (middle area)
            if (first) {
                isDragging.current = true;
                onSwipeStart?.();

                // Check if touch is in the middle zone of the card
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const touchY = xy[1];
                    const relativeY = touchY - rect.top;
                    const cardHeight = rect.height;

                    // Calculate edge zone sizes
                    const topEdge = cardHeight * EDGE_ZONE_PERCENT;
                    const bottomEdge = cardHeight * (1 - EDGE_ZONE_PERCENT);

                    // Only allow card swipe if touched in the middle zone
                    isInSwipeZone.current = relativeY > topEdge && relativeY < bottomEdge;
                }
            }

            // If touch started outside swipe zone, cancel the gesture and allow page navigation
            if (!isInSwipeZone.current) {
                if (cancel) cancel();
                return;
            }

            // Signal card swipe active when there's meaningful horizontal movement
            if (active && Math.abs(mx) > 10 && !isCardSwipeActive.current) {
                isCardSwipeActive.current = true;
                dispatchCardSwipeStart();
            }

            // Determine available directions
            const canSwipeLeft = !!rightAction && !rightAction.disabled; // Swipe left to reveal right action
            const canSwipeRight = !!leftAction && !leftAction.disabled;   // Swipe right to reveal left action

            // Restrict movement based on available actions
            let boundedX = mx;
            if (!canSwipeLeft && mx < 0) boundedX = 0;
            if (!canSwipeRight && mx > 0) boundedX = 0;

            // Apply rubber-band resistance at edges
            const maxDrag = TRIGGER_THRESHOLD * 1.5;
            if (Math.abs(boundedX) > TRIGGER_THRESHOLD) {
                const overflow = Math.abs(boundedX) - TRIGGER_THRESHOLD;
                const dampedOverflow = overflow * 0.3;
                boundedX = (boundedX > 0 ? 1 : -1) * (TRIGGER_THRESHOLD + dampedOverflow);
            }
            boundedX = Math.max(-maxDrag, Math.min(maxDrag, boundedX));

            if (active) {
                // Update position
                api.start({ x: boundedX, immediate: true });
            } else if (last) {
                isDragging.current = false;
                if (isCardSwipeActive.current) {
                    isCardSwipeActive.current = false;
                    dispatchCardSwipeEnd();
                }
                onSwipeEnd?.();

                // Check if we should trigger action
                const triggered = Math.abs(mx) > TRIGGER_THRESHOLD || Math.abs(vx) > CARD_RETURN_VELOCITY;

                if (triggered) {
                    if (mx < -TRIGGER_THRESHOLD && canSwipeLeft) {
                        triggerAction(rightAction, 'left');
                        return;
                    } else if (mx > TRIGGER_THRESHOLD && canSwipeRight) {
                        triggerAction(leftAction, 'right');
                        return;
                    }
                }

                // Return to center
                resetCard();
            }
        },
        {
            axis: 'x',
            filterTaps: true,
            rubberband: 0.15,
            pointer: { touch: true },
        }
    );

    // Prevent click events when dragging
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (isDragging.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, []);

    // Calculate action button opacity based on swipe distance
    const leftActionOpacity = x.to((val) => Math.min(1, Math.max(0, val / REVEAL_THRESHOLD)));
    const rightActionOpacity = x.to((val) => Math.min(1, Math.max(0, -val / REVEAL_THRESHOLD)));

    // Scale for action icons
    const leftActionScale = x.to((val) => {
        if (val > TRIGGER_THRESHOLD) return 1.2;
        if (val > REVEAL_THRESHOLD) return 1 + (val - REVEAL_THRESHOLD) / (TRIGGER_THRESHOLD - REVEAL_THRESHOLD) * 0.2;
        return 0.8 + (val / REVEAL_THRESHOLD) * 0.2;
    });

    const rightActionScale = x.to((val) => {
        if (-val > TRIGGER_THRESHOLD) return 1.2;
        if (-val > REVEAL_THRESHOLD) return 1 + (-val - REVEAL_THRESHOLD) / (TRIGGER_THRESHOLD - REVEAL_THRESHOLD) * 0.2;
        return 0.8 + (-val / REVEAL_THRESHOLD) * 0.2;
    });

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
        >
            {/* Left Action (revealed when swiping right) */}
            {leftAction && !leftAction.disabled && (
                <animated.div
                    className={cn(
                        "absolute inset-y-0 left-0 flex items-center justify-start pl-4 rounded-2xl",
                        leftAction.bgColor
                    )}
                    style={{
                        opacity: leftActionOpacity,
                        width: x.to((val) => Math.max(0, val)),
                    }}
                >
                    <animated.div
                        className={cn(
                            "flex flex-col items-center gap-1",
                            leftAction.color
                        )}
                        style={{ scale: leftActionScale }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            {leftAction.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                            {leftAction.label}
                        </span>
                    </animated.div>
                    {x.to((val) => val > TRIGGER_THRESHOLD) && (
                        <animated.div
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            style={{ opacity: x.to((val) => Math.min(1, (val - TRIGGER_THRESHOLD) / 30)) }}
                        >
                            <ChevronRight className={cn("h-5 w-5", leftAction.color)} />
                        </animated.div>
                    )}
                </animated.div>
            )}

            {/* Right Action (revealed when swiping left) */}
            {rightAction && !rightAction.disabled && (
                <animated.div
                    className={cn(
                        "absolute inset-y-0 right-0 flex items-center justify-end pr-4 rounded-2xl",
                        rightAction.bgColor
                    )}
                    style={{
                        opacity: rightActionOpacity,
                        width: x.to((val) => Math.max(0, -val)),
                    }}
                >
                    <animated.div
                        className={cn(
                            "flex flex-col items-center gap-1",
                            rightAction.color
                        )}
                        style={{ scale: rightActionScale }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            {rightAction.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                            {rightAction.label}
                        </span>
                    </animated.div>
                    {x.to((val) => -val > TRIGGER_THRESHOLD) && (
                        <animated.div
                            className="absolute left-2 top-1/2 -translate-y-1/2"
                            style={{ opacity: x.to((val) => Math.min(1, (-val - TRIGGER_THRESHOLD) / 30)) }}
                        >
                            <ChevronLeft className={cn("h-5 w-5", rightAction.color)} />
                        </animated.div>
                    )}
                </animated.div>
            )}

            {/* Main Card Content */}
            <animated.div
                {...bind()}
                onClick={handleClick}
                className="relative touch-pan-y"
                style={{
                    x,
                    touchAction: 'pan-y',
                    cursor: disabled ? 'default' : 'grab',
                }}
            >
                {children}
            </animated.div>
        </div>
    );
};

// Default action configurations for common use cases
export const createDeleteAction = (onDelete: () => void, disabled = false): SwipeAction => ({
    icon: <Trash2 className="h-5 w-5" />,
    label: 'Delete',
    color: 'text-white',
    bgColor: 'bg-destructive',
    onAction: onDelete,
    disabled,
});

export const createQuickAction = (
    icon: React.ReactNode,
    label: string,
    onAction: () => void,
    disabled = false
): SwipeAction => ({
    icon,
    label,
    color: 'text-white',
    bgColor: 'bg-emerald-500',
    onAction,
    disabled,
});

export const createConfirmAction = (onConfirm: () => void, disabled = false): SwipeAction => ({
    icon: <Check className="h-5 w-5" />,
    label: 'Confirm',
    color: 'text-white',
    bgColor: 'bg-emerald-500',
    onAction: onConfirm,
    disabled,
});
