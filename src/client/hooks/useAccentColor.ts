import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type AccentColor = 'violet' | 'blue' | 'teal' | 'rose' | 'amber' | 'emerald';

export interface AccentOption {
    value: AccentColor;
    label: string;
    color: string; // Hex color for preview
}

export const accentOptions: AccentOption[] = [
    { value: 'violet', label: 'Violet', color: '#7C3AED' },
    { value: 'blue', label: 'Blue', color: '#3B82F6' },
    { value: 'teal', label: 'Teal', color: '#14B8A6' },
    { value: 'rose', label: 'Rose', color: '#F43F5E' },
    { value: 'amber', label: 'Amber', color: '#F59E0B' },
    { value: 'emerald', label: 'Emerald', color: '#10B981' },
];

export function useAccentColor() {
    const [accent, setAccent] = useLocalStorage<AccentColor>('pabili-accent', 'violet');

    // Apply the data-accent attribute to the document root
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-accent', accent);
    }, [accent]);

    // Reset to default accent
    const resetAccent = useCallback(() => {
        setAccent('violet');
    }, [setAccent]);

    return {
        accent,
        setAccent,
        resetAccent,
        accentOptions,
    };
}
