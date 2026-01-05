import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollOptions {
    threshold?: number;
}

export const useScroll = (options: UseScrollOptions = {}) => {
    const { threshold = 100 } = options;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isScrollingDown, setIsScrollingDown] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
    const lastScrollY = useRef(0);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;

        setIsScrolled(currentScrollY > threshold);
        setIsAtTop(currentScrollY < 10);
        // Hide as soon as we scroll down even a little bit
        setIsScrollingDown(currentScrollY > lastScrollY.current && currentScrollY > 10);

        lastScrollY.current = currentScrollY;
    }, [threshold]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, []);

    return { isScrolled, isScrollingDown, isAtTop, scrollToTop };
};
