import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'pabili-offline';
const DB_VERSION = 1;

interface PendingItem<T> {
    id: string;
    data: T;
    timestamp: number;
    type: string;
}

type StoreName = 'pending-orders' | 'pending-payments';

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains('pending-orders')) {
                db.createObjectStore('pending-orders', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('pending-payments')) {
                db.createObjectStore('pending-payments', { keyPath: 'id' });
            }
        };
    });
}

export function useOfflineStorage<T>(storeName: StoreName) {
    const [pendingItems, setPendingItems] = useState<PendingItem<T>[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load pending items on mount
    useEffect(() => {
        loadPendingItems();
    }, [storeName]);

    const loadPendingItems = useCallback(async () => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                setPendingItems(request.result);
                setIsLoading(false);
            };

            request.onerror = () => {
                console.error('Failed to load pending items');
                setIsLoading(false);
            };
        } catch (error) {
            console.error('IndexedDB error:', error);
            setIsLoading(false);
        }
    }, [storeName]);

    const addPendingItem = useCallback(async (data: T, type: string = 'create') => {
        const item: PendingItem<T> = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            data,
            timestamp: Date.now(),
            type,
        };

        try {
            const db = await openDatabase();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            await new Promise<void>((resolve, reject) => {
                const request = store.add(item);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            setPendingItems((prev) => [...prev, item]);

            // Register for background sync if available
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                const syncTag = storeName === 'pending-orders' ? 'sync-orders' : 'sync-payments';
                await (registration as any).sync.register(syncTag);
            }

            return item.id;
        } catch (error) {
            console.error('Failed to add pending item:', error);
            throw error;
        }
    }, [storeName]);

    const removePendingItem = useCallback(async (id: string) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            await new Promise<void>((resolve, reject) => {
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            setPendingItems((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Failed to remove pending item:', error);
            throw error;
        }
    }, [storeName]);

    const clearPendingItems = useCallback(async () => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            await new Promise<void>((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            setPendingItems([]);
        } catch (error) {
            console.error('Failed to clear pending items:', error);
            throw error;
        }
    }, [storeName]);

    return {
        pendingItems,
        pendingCount: pendingItems.length,
        isLoading,
        addPendingItem,
        removePendingItem,
        clearPendingItems,
        refresh: loadPendingItems,
    };
}

// Hook to track online/offline status
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

// Hook to listen for service worker sync messages
export function useSyncListener(onSync?: (type: string, data: unknown) => void) {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'order-synced' || event.data.type === 'payment-synced') {
                onSync?.(event.data.type, event.data.data);
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
        };
    }, [onSync]);
}

// Hook to listen for custom sync events dispatched by main.tsx
export function useSyncEvents(onOrderSync?: (data: unknown) => void, onPaymentSync?: (data: unknown) => void) {
    useEffect(() => {
        const handleOrderSync = (event: Event) => {
            onOrderSync?.((event as CustomEvent).detail);
        };

        const handlePaymentSync = (event: Event) => {
            onPaymentSync?.((event as CustomEvent).detail);
        };

        window.addEventListener('order-synced', handleOrderSync);
        window.addEventListener('payment-synced', handlePaymentSync);

        return () => {
            window.removeEventListener('order-synced', handleOrderSync);
            window.removeEventListener('payment-synced', handlePaymentSync);
        };
    }, [onOrderSync, onPaymentSync]);
}

// Utility to manually trigger background sync
export async function triggerBackgroundSync(tag: 'sync-orders' | 'sync-payments' | 'sync-all') {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await (registration as any).sync.register(tag);
            console.log('[Offline] Background sync registered:', tag);
            return true;
        } catch (error) {
            console.error('[Offline] Background sync registration failed:', error);
            return false;
        }
    }
    return false;
}

// Utility to request manual sync via SW message
export function requestManualSync() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
        return true;
    }
    return false;
}

