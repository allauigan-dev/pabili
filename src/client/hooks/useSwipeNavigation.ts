import { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to handle mobile horizontal swipe gestures for navigation with visual feedback.
 * Navigates between main pages in the bottom navigation.
 */
export const useSwipeNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [currentTouchX, setCurrentTouchX] = useState<number | null>(null);
    const startTime = useRef<number>(0);

    // Minimum distance for a swipe to be recognized (pixels)
    const minSwipeDistance = 60;
    // Velocity threshold (px/ms) - if swiped fast, trigger even if distance is small
    const velocityThreshold = 0.5;

    // Define the sequence of routes for swipe navigation
    const navRoutes = useMemo(() => ['/', '/orders', '/stores', '/payments'], []);

    // Only enable swipe on these specific main routes
    const isMainRoute = navRoutes.includes(location.pathname);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        // Only track swipes if we are on a main route and it's mobile view
        if (!isMainRoute || window.innerWidth >= 768 || e.defaultPrevented) return;

        // Don't trigger if swiping on an element that might have its own horizontal scroll
        // or specifically designated to block swipes
        const target = e.target as HTMLElement;

        const isInsideBlockedElement = (el: HTMLElement | null): boolean => {
            if (!el) return false;
            // Block if explicitly marked or inside a dialog/fixed overlay
            if (el.hasAttribute('data-no-swipe') ||
                el.getAttribute('role') === 'dialog' ||
                el.hasAttribute('aria-modal') ||
                (el.classList.contains('fixed') && !el.classList.contains('md:ml-64'))) { // md:ml-64 is our sidebar-matching container
                return true;
            }
            return isInsideBlockedElement(el.parentElement);
        };

        const hasHorizontalScroll = (el: HTMLElement | null): boolean => {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            if (el.scrollWidth > el.clientWidth && (style.overflowX === 'auto' || style.overflowX === 'scroll')) {
                return true;
            }
            return hasHorizontalScroll(el.parentElement);
        };

        if (isInsideBlockedElement(target) || hasHorizontalScroll(target)) return;

        setTouchStart(e.targetTouches[0].clientX);
        setCurrentTouchX(e.targetTouches[0].clientX);
        startTime.current = Date.now();
    }, [isMainRoute]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isMainRoute || window.innerWidth >= 768 || touchStart === null) return;

        setCurrentTouchX(e.targetTouches[0].clientX);
    }, [isMainRoute, touchStart]);

    const onTouchEnd = useCallback(() => {
        if (touchStart === null || currentTouchX === null || !isMainRoute || window.innerWidth >= 768) {
            setTouchStart(null);
            setCurrentTouchX(null);
            return;
        }

        const distance = touchStart - currentTouchX;
        const duration = Date.now() - startTime.current;
        const velocity = Math.abs(distance) / duration;

        const isLeftSwipe = distance > minSwipeDistance || (distance > 20 && velocity > velocityThreshold);
        const isRightSwipe = distance < -minSwipeDistance || (distance < -20 && velocity > velocityThreshold);

        const currentIndex = navRoutes.indexOf(location.pathname);

        if (isLeftSwipe) {
            const nextIndex = (currentIndex + 1) % navRoutes.length;
            navigate(navRoutes[nextIndex]);
        } else if (isRightSwipe) {
            const prevIndex = (currentIndex - 1 + navRoutes.length) % navRoutes.length;
            navigate(navRoutes[prevIndex]);
        }

        setTouchStart(null);
        setCurrentTouchX(null);
    }, [touchStart, currentTouchX, location.pathname, navigate, isMainRoute, navRoutes]);

    // Calculate translation style for visual feedback
    const style = useMemo(() => {
        if (touchStart === null || currentTouchX === null) {
            return {
                transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                transform: 'translateX(0)'
            };
        }

        const distance = currentTouchX - touchStart;
        // Dampen the drag behavior - feels more premium
        const dampenedDistance = distance * 0.8;

        return {
            transform: `translateX(${dampenedDistance}px)`,
            transition: 'none',
            filter: `blur(${Math.min(Math.abs(distance) / 100, 2)}px)`,
            opacity: Math.max(1 - Math.abs(distance) / 1000, 0.9)
        };
    }, [touchStart, currentTouchX]);

    const direction = touchStart !== null && currentTouchX !== null
        ? (currentTouchX > touchStart ? 'right' : 'left')
        : null;

    return {
        touchHandlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
        },
        style,
        isSwiping: touchStart !== null,
        direction,
        distance: touchStart !== null && currentTouchX !== null ? currentTouchX - touchStart : 0
    };
};
