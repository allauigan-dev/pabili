const CACHE_VERSION = 'v2';
const STATIC_CACHE = `pabili-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pabili-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `pabili-images-${CACHE_VERSION}`;

// Static assets to precache
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
    '/icons_and_manifest/icons/icon-192x192.png',
    '/icons_and_manifest/icons/icon-512x512.png'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return cacheName.startsWith('pabili-') &&
                            !cacheName.includes(CACHE_VERSION);
                    })
                    .map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests
    if (url.origin !== location.origin) return;

    // API requests - Network First with cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
        return;
    }

    // Images - Stale While Revalidate
    if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
        return;
    }

    // HTML pages - Network First (SPA needs fresh shell)
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(networkFirstWithOffline(request));
        return;
    }

    // Static assets (JS, CSS) - Cache First
    event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// Cache First Strategy - for static assets
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return new Response('Offline', { status: 503 });
    }
}

// Network First with Cache Fallback - for API
async function networkFirstWithCache(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({
            success: false,
            error: 'You are offline',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Network First with Offline Page Fallback - for navigation
async function networkFirstWithOffline(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Return offline page for navigation requests
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) return offlinePage;

        return new Response('Offline', { status: 503 });
    }
}

// Stale While Revalidate - for images
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const networkPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);

    return cached || networkPromise;
}

// Background Sync for offline order submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
    if (event.tag === 'sync-payments') {
        event.waitUntil(syncPayments());
    }
});

// Sync pending orders
async function syncOrders() {
    const pendingOrders = await getPendingData('pending-orders');

    for (const order of pendingOrders) {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order.data)
            });

            if (response.ok) {
                await removePendingData('pending-orders', order.id);
                await notifyClients('order-synced', order.id);
            }
        } catch (error) {
            console.error('Failed to sync order:', order.id, error);
        }
    }
}

// Sync pending payments
async function syncPayments() {
    const pendingPayments = await getPendingData('pending-payments');

    for (const payment of pendingPayments) {
        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payment.data)
            });

            if (response.ok) {
                await removePendingData('pending-payments', payment.id);
                await notifyClients('payment-synced', payment.id);
            }
        } catch (error) {
            console.error('Failed to sync payment:', payment.id, error);
        }
    }
}

// IndexedDB helpers for background sync
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pabili-offline', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending-orders')) {
                db.createObjectStore('pending-orders', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('pending-payments')) {
                db.createObjectStore('pending-payments', { keyPath: 'id' });
            }
        };
    });
}

async function getPendingData(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function removePendingData(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// Notify clients about sync events
async function notifyClients(type, data) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type, data });
    });
}

// Message handler for client communication
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
