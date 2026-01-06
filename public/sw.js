// Pabili Service Worker - Enhanced PWA Caching
// Auto-generated cache version based on deployment timestamp
const CACHE_VERSION = 'v3';
const STATIC_CACHE = `pabili-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pabili-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `pabili-images-${CACHE_VERSION}`;
const FONT_CACHE = `pabili-fonts-${CACHE_VERSION}`;
const API_CACHE = `pabili-api-${CACHE_VERSION}`;

// Cache size limits to prevent storage issues
const CACHE_LIMITS = {
    [DYNAMIC_CACHE]: 50,
    [IMAGE_CACHE]: 100,
    [API_CACHE]: 30,
};

// Core static assets to precache (always available offline)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
    '/icons_and_manifest/icons/icon-48x48.png',
    '/icons_and_manifest/icons/icon-72x72.png',
    '/icons_and_manifest/icons/icon-96x96.png',
    '/icons_and_manifest/icons/icon-128x128.png',
    '/icons_and_manifest/icons/icon-144x144.png',
    '/icons_and_manifest/icons/icon-152x152.png',
    '/icons_and_manifest/icons/icon-192x192.png',
    '/icons_and_manifest/icons/icon-256x256.png',
    '/icons_and_manifest/icons/icon-384x384.png',
    '/icons_and_manifest/icons/icon-512x512.png',
];

// API endpoints to cache for offline access
const CACHEABLE_API_PATTERNS = [
    '/api/orders',
    '/api/stores',
    '/api/customers',
    '/api/payments',
    '/api/invoices',
];

// ============================================
// INSTALL EVENT - Precache static assets
// ============================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing new version:', CACHE_VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Precaching core assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Skip waiting and activate immediately');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Precache failed:', error);
            })
    );
});

// ============================================
// ACTIVATE EVENT - Clean up old caches
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new version:', CACHE_VERSION);

    event.waitUntil(
        Promise.all([
            // Delete old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete any cache that starts with 'pabili-' but doesn't have current version
                            return cacheName.startsWith('pabili-') && !cacheName.includes(CACHE_VERSION);
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});

// ============================================
// FETCH EVENT - Intelligent caching strategies
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Handle different request types with appropriate strategies

    // 1. Google Fonts - Cache First (fonts rarely change)
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirst(request, FONT_CACHE, { maxAge: 365 * 24 * 60 * 60 * 1000 }));
        return;
    }

    // 2. Skip cross-origin requests (except fonts above)
    if (url.origin !== location.origin) return;

    // 3. API requests - Network First with cache fallback
    if (url.pathname.startsWith('/api/')) {
        // Only cache GET requests for specific API patterns
        const isCacheable = CACHEABLE_API_PATTERNS.some(pattern => url.pathname.startsWith(pattern));

        if (isCacheable) {
            event.respondWith(networkFirstWithCache(request, API_CACHE));
        } else {
            event.respondWith(networkOnly(request));
        }
        return;
    }

    // 4. Images - Stale While Revalidate
    if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
        return;
    }

    // 5. HTML pages (navigation) - Network First with offline fallback
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(networkFirstWithOffline(request));
        return;
    }

    // 6. Static assets (JS, CSS, Fonts) - Cache First
    if (
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font' ||
        url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/i)
    ) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // 7. Everything else - Cache First
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
});

// ============================================
// CACHING STRATEGIES
// ============================================

/**
 * Cache First Strategy - Returns cached response, falls back to network
 * Best for: Static assets, fonts, images that rarely change
 */
async function cacheFirst(request, cacheName, options = {}) {
    const cached = await caches.match(request);

    if (cached) {
        // Check if cache is still valid based on maxAge
        if (options.maxAge) {
            const dateHeader = cached.headers.get('date');
            if (dateHeader) {
                const cacheAge = Date.now() - new Date(dateHeader).getTime();
                if (cacheAge > options.maxAge) {
                    // Cache expired, try network
                    try {
                        return await fetchAndCache(request, cacheName);
                    } catch (error) {
                        return cached; // Return stale on network failure
                    }
                }
            }
        }
        return cached;
    }

    try {
        return await fetchAndCache(request, cacheName);
    } catch (error) {
        console.error('[SW] Cache First failed:', error);
        return new Response('Resource not available offline', { status: 503 });
    }
}

/**
 * Network First with Cache Fallback - Try network, fall back to cache
 * Best for: API requests where fresh data is preferred
 */
async function networkFirstWithCache(request, cacheName) {
    try {
        const response = await fetch(request);

        if (response.ok) {
            // Cache the successful response
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());

            // Trim cache to limit
            trimCache(cacheName, CACHE_LIMITS[cacheName] || 50);
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Return offline-friendly JSON response for API requests
        return new Response(JSON.stringify({
            success: false,
            error: 'You are offline. Data may be outdated.',
            offline: true,
            timestamp: Date.now()
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Network First with Offline Page Fallback - For navigation requests
 * Best for: HTML pages in an SPA
 */
async function networkFirstWithOffline(request) {
    try {
        const response = await fetch(request);

        if (response.ok) {
            // Cache the app shell for offline use
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Navigation offline, trying cache:', request.url);

        // Try to find cached version of the page
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Try returning the cached index.html (SPA fallback)
        const indexCached = await caches.match('/index.html');
        if (indexCached) {
            return indexCached;
        }

        // Last resort: show offline page
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        return new Response('You are offline', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

/**
 * Stale While Revalidate - Return cached, fetch in background
 * Best for: Frequently updated content where some staleness is acceptable
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Fetch in background regardless
    const networkPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
                // Trim cache after adding
                trimCache(cacheName, CACHE_LIMITS[cacheName] || 100);
            }
            return response;
        })
        .catch(() => cached);

    // Return cached immediately if available, otherwise wait for network
    return cached || networkPromise;
}

/**
 * Network Only - No caching
 * Best for: Other API calls, POST requests
 */
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Network request failed. Please check your connection.',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Helper: Fetch and cache response
 */
async function fetchAndCache(request, cacheName) {
    const response = await fetch(request);

    if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());

        // Trim cache after adding
        if (CACHE_LIMITS[cacheName]) {
            trimCache(cacheName, CACHE_LIMITS[cacheName]);
        }
    }

    return response;
}

/**
 * Helper: Trim cache to prevent it from growing too large
 */
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxItems) {
        // Delete oldest entries (FIFO)
        const keysToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
        console.log(`[SW] Trimmed ${keysToDelete.length} items from ${cacheName}`);
    }
}

// ============================================
// BACKGROUND SYNC - Offline submissions
// ============================================
self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
    if (event.tag === 'sync-payments') {
        event.waitUntil(syncPayments());
    }
    if (event.tag === 'sync-all') {
        event.waitUntil(Promise.all([syncOrders(), syncPayments()]));
    }
});

/**
 * Sync pending orders to server
 */
async function syncOrders() {
    console.log('[SW] Syncing pending orders');
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
                await notifyClients('order-synced', { id: order.id, ...order.data });
                console.log('[SW] Order synced successfully:', order.id);
            } else {
                console.error('[SW] Order sync failed:', order.id, response.status);
            }
        } catch (error) {
            console.error('[SW] Failed to sync order:', order.id, error);
            // Will retry on next sync
        }
    }
}

/**
 * Sync pending payments to server
 */
async function syncPayments() {
    console.log('[SW] Syncing pending payments');
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
                await notifyClients('payment-synced', { id: payment.id, ...payment.data });
                console.log('[SW] Payment synced successfully:', payment.id);
            } else {
                console.error('[SW] Payment sync failed:', payment.id, response.status);
            }
        } catch (error) {
            console.error('[SW] Failed to sync payment:', payment.id, error);
            // Will retry on next sync
        }
    }
}

// ============================================
// INDEXEDDB HELPERS
// ============================================
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
            if (!db.objectStoreNames.contains('draft-orders')) {
                db.createObjectStore('draft-orders', { keyPath: 'id' });
            }
        };
    });
}

async function getPendingData(storeName) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || []);
        });
    } catch (error) {
        console.error('[SW] Failed to get pending data:', error);
        return [];
    }
}

async function removePendingData(storeName, id) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.error('[SW] Failed to remove pending data:', error);
    }
}

// ============================================
// CLIENT COMMUNICATION
// ============================================

/**
 * Notify all clients about sync events
 */
async function notifyClients(type, data) {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    console.log(`[SW] Notifying ${clients.length} clients:`, type);

    clients.forEach(client => {
        client.postMessage({ type, data, timestamp: Date.now() });
    });
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'GET_VERSION':
            event.source.postMessage({
                type: 'VERSION',
                version: CACHE_VERSION
            });
            break;

        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.keys().then(names =>
                    Promise.all(names.map(name => caches.delete(name)))
                ).then(() => {
                    event.source.postMessage({ type: 'CACHE_CLEARED' });
                })
            );
            break;

        case 'SYNC_NOW':
            // Manually trigger sync
            Promise.all([syncOrders(), syncPayments()])
                .then(() => {
                    event.source.postMessage({ type: 'SYNC_COMPLETE' });
                });
            break;
    }
});

// ============================================
// PERIODIC SYNC (for browsers that support it)
// ============================================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'sync-pending') {
        event.waitUntil(Promise.all([syncOrders(), syncPayments()]));
    }
});

// ============================================
// PUSH NOTIFICATIONS (placeholder for future)
// ============================================
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons_and_manifest/icons/icon-192x192.png',
        badge: '/icons_and_manifest/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: data.url || '/',
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Pabili', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data || '/')
    );
});

console.log('[SW] Service Worker loaded:', CACHE_VERSION);
