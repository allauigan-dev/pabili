import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
    const [theme, setTheme] = useLocalStorage<Theme>('pabili-theme', 'system');
    const [isAmoled, setIsAmoled] = useLocalStorage<boolean>('pabili-amoled', false);

    // Determine the effective theme (resolving 'system' to actual value)
    const getEffectiveTheme = useCallback((): 'light' | 'dark' => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    }, [theme]);

    // Apply or remove the 'dark' and 'amoled' classes on the html element
    useEffect(() => {
        const effectiveTheme = getEffectiveTheme();
        const root = document.documentElement;

        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
            if (isAmoled) {
                root.classList.add('amoled');
            } else {
                root.classList.remove('amoled');
            }
        } else {
            root.classList.remove('dark');
            root.classList.remove('amoled');
        }
    }, [getEffectiveTheme, isAmoled]);

    // Listen for system theme changes when in 'system' mode
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            if (e.matches) {
                root.classList.add('dark');
                if (isAmoled) {
                    root.classList.add('amoled');
                }
            } else {
                root.classList.remove('dark');
                root.classList.remove('amoled');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, isAmoled]);

    // Toggle between light and dark (skipping system)
    const toggleTheme = useCallback(() => {
        const effectiveTheme = getEffectiveTheme();
        setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
    }, [getEffectiveTheme, setTheme]);

    // Toggle AMOLED mode
    const toggleAmoled = useCallback(() => {
        setIsAmoled(prev => !prev);
    }, [setIsAmoled]);

    // Check if currently in dark mode
    const isDark = getEffectiveTheme() === 'dark';

    return {
        theme,
        setTheme,
        toggleTheme,
        isDark,
        isAmoled,
        toggleAmoled,
    };
}

