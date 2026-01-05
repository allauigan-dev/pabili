import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * 
 * Automatically scrolls the window to the top (0, 0) whenever the route pathname changes.
 * This should be placed inside the BrowserRouter but outside of Routes.
 */
export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant', // Use 'instant' for immediate jump, or 'smooth' if animation is desired
        });
    }, [pathname]);

    return null;
};
