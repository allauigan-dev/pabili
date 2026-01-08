import React, { useCallback, useEffect, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { useSpring, animated, config } from '@react-spring/web';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Configuration
const DISMISS_THRESHOLD = 100;     // Pixels to dismiss
const VELOCITY_THRESHOLD = 0.5;    // Velocity for quick dismiss

interface BottomSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    open,
    onOpenChange,
    children,
    className,
}) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const contentHeight = useRef(400); // Default height

    // Spring for sheet position (y offset from bottom)
    const [{ y }, api] = useSpring(() => ({
        y: 0,
        config: { tension: 300, friction: 25 },
    }));

    // Spring for backdrop opacity
    const [{ opacity }, backdropApi] = useSpring(() => ({
        opacity: 0,
        config: { tension: 300, friction: 25 },
    }));

    // Measure content height when opened
    useEffect(() => {
        if (open && sheetRef.current) {
            contentHeight.current = sheetRef.current.offsetHeight;
        }
    }, [open, children]);

    // Handle open/close state
    useEffect(() => {
        if (open) {
            // Animate in
            api.start({ y: 0, immediate: false });
            backdropApi.start({ opacity: 1 });
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Animate out
            api.start({ y: contentHeight.current + 50 });
            backdropApi.start({ opacity: 0 });
            // Restore body scroll
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open, api, backdropApi]);

    // Close the sheet
    const close = useCallback(() => {
        api.start({
            y: contentHeight.current + 50,
            config: { tension: 300, friction: 25 },
            onRest: () => {
                onOpenChange(false);
            },
        });
        backdropApi.start({ opacity: 0 });
    }, [api, backdropApi, onOpenChange]);

    // Drag gesture
    const bind = useDrag(
        ({ active, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
            // Only allow downward drag
            const boundedY = Math.max(0, my);

            if (active) {
                api.start({ y: boundedY, immediate: true });
                // Update backdrop opacity based on drag
                const progress = Math.min(1, boundedY / DISMISS_THRESHOLD);
                backdropApi.start({ opacity: 1 - progress * 0.5, immediate: true });
            } else {
                // Check if should dismiss
                const shouldDismiss =
                    boundedY > DISMISS_THRESHOLD ||
                    (vy > VELOCITY_THRESHOLD && dy > 0);

                if (shouldDismiss) {
                    close();
                } else {
                    // Snap back
                    api.start({ y: 0, config: config.wobbly });
                    backdropApi.start({ opacity: 1 });
                }
            }
        },
        {
            axis: 'y',
            filterTaps: true,
            pointer: { touch: true },
            from: () => [0, y.get()],
        }
    );

    // Handle backdrop click
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            close();
        }
    }, [close]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                close();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, close]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[70]">
            {/* Backdrop */}
            <animated.div
                onClick={handleBackdropClick}
                className="absolute inset-0 bg-black/50"
                style={{ opacity }}
            />

            {/* Sheet */}
            <animated.div
                ref={sheetRef}
                {...bind()}
                className={cn(
                    "absolute bottom-0 left-0 right-0",
                    "bg-background rounded-t-2xl shadow-2xl",
                    "touch-pan-x",
                    "max-h-[90vh] overflow-hidden",
                    className
                )}
                style={{
                    y,
                    touchAction: 'pan-x',
                }}
                role="dialog"
                aria-modal="true"
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Content */}
                <div className="px-4 pb-8 overflow-y-auto max-h-[calc(90vh-40px)]">
                    {children}
                </div>
            </animated.div>
        </div>,
        document.body
    );
};

// Sheet Header
interface BottomSheetHeaderProps {
    className?: string;
    children: React.ReactNode;
}

export const BottomSheetHeader: React.FC<BottomSheetHeaderProps> = ({
    className,
    children,
}) => (
    <div className={cn("flex flex-col gap-2 text-center pb-4", className)}>
        {children}
    </div>
);

// Sheet Title
interface BottomSheetTitleProps {
    className?: string;
    children: React.ReactNode;
}

export const BottomSheetTitle: React.FC<BottomSheetTitleProps> = ({
    className,
    children,
}) => (
    <h2 className={cn("text-lg font-semibold", className)}>
        {children}
    </h2>
);

// Sheet Description
interface BottomSheetDescriptionProps {
    className?: string;
    children: React.ReactNode;
}

export const BottomSheetDescription: React.FC<BottomSheetDescriptionProps> = ({
    className,
    children,
}) => (
    <p className={cn("text-sm text-muted-foreground", className)}>
        {children}
    </p>
);

// Sheet Footer
interface BottomSheetFooterProps {
    className?: string;
    children: React.ReactNode;
}

export const BottomSheetFooter: React.FC<BottomSheetFooterProps> = ({
    className,
    children,
}) => (
    <div className={cn("flex flex-col gap-2 mt-4", className)}>
        {children}
    </div>
);

export default BottomSheet;
