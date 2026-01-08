import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavConfig } from './useNavConfig';

/**
 * Custom hook to handle mobile horizontal swipe gestures for navigation with visual feedback.
 * Navigates between main pages in the bottom navigation.
 * Only activates for predominantly horizontal swipes to avoid interfering with scrolling.
 * Listens to card-swipe-start/end events to avoid conflicts with SwipeableCard gestures.
 * Uses the same navigation config as the bottom nav for consistent behavior.
 */
export const useSwipeNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bottomNavItems } = useNavConfig();

    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [currentTouchX, setCurrentTouchX] = useState<number | null>(null);
    const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);
    const startTime = useRef<number>(0);
    const isCardSwipeActive = useRef<boolean>(false);

    // Listen for card swipe events to prevent navigation during card swipes
    useEffect(() => {
        const handleCardSwipeStart = () => {
            isCardSwipeActive.current = true;
            // Reset any in-progress page swipe when card swipe starts
            setTouchStart(null);
            setCurrentTouchX(null);
            setIsHorizontalSwipe(null);
        };

        const handleCardSwipeEnd = () => {
            isCardSwipeActive.current = false;
        };

        window.addEventListener('card-swipe-start', handleCardSwipeStart);
        window.addEventListener('card-swipe-end', handleCardSwipeEnd);

        return () => {
            window.removeEventListener('card-swipe-start', handleCardSwipeStart);
            window.removeEventListener('card-swipe-end', handleCardSwipeEnd);
        };
    }, []);

    // Minimum distance for a swipe to be recognized (pixels)
    const minSwipeDistance = 60;
    // Velocity threshold (px/ms) - if swiped fast, trigger even if distance is small
    const velocityThreshold = 0.5;

    // Get navigation routes from the bottom nav configuration (follows user's customizations)
    const navRoutes = useMemo(() => bottomNavItems.map(item => item.to), [bottomNavItems]);

    // Only enable swipe on routes that are in the bottom navigation
    const isMainRoute = navRoutes.includes(location.pathname);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        // Only track swipes if we are on a main route and it's mobile view
        // Also skip if a card swipe is currently active
        if (!isMainRoute || window.innerWidth >= 768 || e.defaultPrevented || isCardSwipeActive.current) return;

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

        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
        setCurrentTouchX(e.targetTouches[0].clientX);
        setIsHorizontalSwipe(null); // Reset direction detection
        startTime.current = Date.now();
    }, [isMainRoute]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        // Also skip if a card swipe became active during the gesture
        if (!isMainRoute || window.innerWidth >= 768 || touchStart === null || isCardSwipeActive.current) return;

        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;

        // Determine swipe direction on first significant move
        if (isHorizontalSwipe === null) {
            const deltaX = Math.abs(currentX - touchStart.x);
            const deltaY = Math.abs(currentY - touchStart.y);

            // Only set direction once we have enough movement to determine
            if (deltaX > 10 || deltaY > 10) {
                setIsHorizontalSwipe(deltaX > deltaY * 1.5); // Must be predominantly horizontal
            }
        }

        // Only track horizontal movement if we've confirmed it's a horizontal swipe
        if (isHorizontalSwipe === true) {
            setCurrentTouchX(currentX);
        }
    }, [isMainRoute, touchStart, isHorizontalSwipe]);

    const onTouchEnd = useCallback(() => {
        if (touchStart === null || currentTouchX === null || !isMainRoute || window.innerWidth >= 768 || isHorizontalSwipe !== true) {
            setTouchStart(null);
            setCurrentTouchX(null);
            setIsHorizontalSwipe(null);
            return;
        }

        const distance = touchStart.x - currentTouchX;
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
        setIsHorizontalSwipe(null);
    }, [touchStart, currentTouchX, location.pathname, navigate, isMainRoute, navRoutes, isHorizontalSwipe]);

    // Calculate translation style for visual feedback
    // Only apply visual feedback for confirmed horizontal swipes
    const style = useMemo(() => {
        if (touchStart === null || currentTouchX === null || isHorizontalSwipe !== true) {
            return {
                transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                transform: 'translateX(0)'
            };
        }

        const distance = currentTouchX - touchStart.x;
        // Dampen the drag behavior - feels more premium
        const dampenedDistance = distance * 0.4; // Reduced from 0.8 for subtler effect

        return {
            transform: `translateX(${dampenedDistance}px)`,
            transition: 'none'
        };
    }, [touchStart, currentTouchX, isHorizontalSwipe]);

    const direction = touchStart !== null && currentTouchX !== null && isHorizontalSwipe === true
        ? (currentTouchX > touchStart.x ? 'right' : 'left')
        : null;

    return {
        touchHandlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
        },
        style,
        isSwiping: touchStart !== null && isHorizontalSwipe === true,
        direction,
        distance: touchStart !== null && currentTouchX !== null ? currentTouchX - touchStart.x : 0
    };
};
