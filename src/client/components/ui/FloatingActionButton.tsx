import React from 'react';
import { createPortal } from 'react-dom';
import { Plus, ArrowUp } from 'lucide-react';
import { Button } from './button';
import { useScroll } from '@/hooks/useScroll';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
    onClick: () => void;
    icon?: React.ReactNode;
    threshold?: number;
    className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onClick,
    icon = <Plus className="h-7 w-7" />,
    threshold = 100,
    className,
}) => {
    const { isAtTop, scrollToTop } = useScroll({ threshold });

    // Show scroll-to-top when not at top of page
    const showScrollToTop = !isAtTop;

    const fabContent = (
        <div
            className={cn(
                "fixed right-4 bottom-24 lg:bottom-8 z-40 flex items-center justify-center fab-button",
                className
            )}
        >
            <Button
                onClick={showScrollToTop ? scrollToTop : onClick}
                className={cn(
                    "rounded-full transition-all duration-300 transform active:scale-95 flex items-center justify-center p-0 shadow-lg",
                    showScrollToTop
                        ? "w-12 h-12 bg-surface-light/80 dark:bg-surface-dark/80 text-foreground backdrop-blur-md border border-border/50 hover:bg-surface-light dark:hover:bg-surface-dark"
                        : "w-14 h-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                )}
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Primary action icon */}
                    <div
                        className={cn(
                            "absolute transition-all duration-300",
                            showScrollToTop ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
                        )}
                    >
                        {icon}
                    </div>
                    {/* Scroll to top icon */}
                    <div
                        className={cn(
                            "absolute transition-all duration-300",
                            showScrollToTop ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
                        )}
                    >
                        <ArrowUp className="h-5 w-5" />
                    </div>
                </div>
            </Button>
        </div>
    );

    return createPortal(fabContent, document.body);
};
