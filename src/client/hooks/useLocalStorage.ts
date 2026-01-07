import { useState, useEffect, useCallback } from 'react';

// Custom event name for same-tab localStorage sync
const STORAGE_SYNC_EVENT = 'pabili-storage-sync';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Get from local storage then
    // parse stored json or if none return initialValue
    const readValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    }, [key, initialValue]);

    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage and dispatches sync event
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            setStoredValue(prev => {
                const valueToStore = value instanceof Function ? value(prev) : value;

                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    // Dispatch custom event for same-tab sync
                    window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, {
                        detail: { key, value: valueToStore }
                    }));
                }

                return valueToStore;
            });
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    useEffect(() => {
        setStoredValue(readValue());
    }, [readValue]);

    // Listen for changes from other tabs (storage event)
    // and same-tab changes (custom event)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(event.newValue) as T);
                } catch {
                    console.warn(`Error parsing localStorage change for key "${key}"`);
                }
            }
        };

        const handleSyncEvent = (event: CustomEvent<{ key: string; value: T }>) => {
            if (event.detail.key === key) {
                setStoredValue(event.detail.value);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(STORAGE_SYNC_EVENT, handleSyncEvent as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(STORAGE_SYNC_EVENT, handleSyncEvent as EventListener);
        };
    }, [key]);

    return [storedValue, setValue] as const;
}
