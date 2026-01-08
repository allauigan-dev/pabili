# Phase 12: Performance & Scalability

> **Priority:** 🟠 High | **Estimated Effort:** 1-2 weeks

## Overview

Optimize application performance leveraging Cloudflare's edge network and implement monitoring for a smooth user experience at scale.

---

## 12.1 Edge Caching

### Cloudflare Cache Configuration

Leverage Cloudflare Workers caching for static assets:

```typescript
// Cache static assets at the edge
app.get('/assets/*', async (c) => {
  const cache = caches.default;
  const cacheKey = new Request(c.req.url, c.req.raw);
  
  // Check cache first
  let response = await cache.match(cacheKey);
  if (response) {
    return response;
  }
  
  // Fetch and cache
  response = await fetch(c.req.raw);
  
  // Cache for 1 year (immutable assets)
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  
  const cachedResponse = new Response(response.body, {
    status: response.status,
    headers,
  });
  
  c.executionCtx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
  
  return cachedResponse;
});
```

### Cache Headers Strategy

| Resource Type | Cache-Control | Duration |
|--------------|---------------|----------|
| Static JS/CSS | `public, max-age=31536000, immutable` | 1 year |
| Images (R2) | `public, max-age=604800` | 7 days |
| API responses | `private, no-cache` | None |
| HTML pages | `public, max-age=0, must-revalidate` | Revalidate |

### Service Worker Caching (PWA)

```javascript
// sw.js - Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Static assets - Cache first
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => 
        cached || fetch(request).then(response => {
          const clone = response.clone();
          caches.open('static-v1').then(cache => cache.put(request, clone));
          return response;
        })
      )
    );
    return;
  }
  
  // API requests - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (request.method === 'GET') {
            const clone = response.clone();
            caches.open('api-v1').then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
});
```

---

## 12.2 Database Optimization

### Query Optimization

Add indexes for common query patterns:

```sql
-- Orders list with filters
CREATE INDEX idx_orders_org_status_date ON orders(
  organization_id, order_status, order_date DESC
);

-- Customer orders lookup
CREATE INDEX idx_orders_customer_date ON orders(
  customer_id, order_date DESC
);

-- Payment lookups
CREATE INDEX idx_payments_org_customer_date ON payments(
  organization_id, customer_id, payment_date DESC
);

-- Invoice lookups
CREATE INDEX idx_invoices_org_customer_status ON invoices(
  organization_id, customer_id, invoice_status
);
```

### Pagination Best Practices

Use cursor-based pagination for large datasets:

```typescript
// Cursor-based pagination
app.get('/api/orders', async (c) => {
  const orgId = c.get('organizationId');
  const cursor = c.req.query('cursor');
  const pageSize = parseInt(c.req.query('pageSize') || '20');
  
  const query = db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.organizationId, orgId),
        cursor ? lt(orders.id, parseInt(cursor)) : undefined
      )
    )
    .orderBy(desc(orders.id))
    .limit(pageSize + 1);
  
  const results = await query;
  const hasMore = results.length > pageSize;
  const items = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? items[items.length - 1].id.toString() : null;
  
  return c.json({
    success: true,
    data: items,
    meta: { nextCursor, hasMore }
  });
});
```

### Query Batching

Batch related queries to reduce database round trips:

```typescript
// Bad: N+1 queries
const orders = await getOrders(orgId);
for (const order of orders) {
  order.customer = await getCustomer(order.customerId); // N queries
}

// Good: Batch with JOIN or separate batch query
const orders = await db
  .select({
    order: orders,
    customer: customers,
    store: stores,
  })
  .from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id))
  .leftJoin(stores, eq(orders.storeId, stores.id))
  .where(eq(orders.organizationId, orgId));
```

---

## 12.3 Image Optimization

### R2 Image Processing

Use Cloudflare Images or on-the-fly resizing:

```typescript
// Image resize endpoint
app.get('/api/files/:key', async (c) => {
  const key = c.req.param('key');
  const width = parseInt(c.req.query('w') || '0');
  const height = parseInt(c.req.query('h') || '0');
  
  // Get from R2
  const object = await c.env.BUCKET.get(key);
  if (!object) {
    return c.json({ error: 'Not found' }, 404);
  }
  
  // If resize requested, use Cloudflare Image Resizing
  if (width || height) {
    const resizedUrl = `https://pabili.app/cdn-cgi/image/width=${width},height=${height},fit=cover/${key}`;
    return c.redirect(resizedUrl);
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=604800',
    },
  });
});
```

### Image Upload Optimization

Compress before upload:

```typescript
// Client-side image compression
import Compressor from 'compressorjs';

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      convertSize: 1000000, // Convert to JPEG if > 1MB
      success: resolve,
      error: reject,
    });
  });
}
```

### Responsive Images

Generate multiple sizes on upload:

```typescript
const imageSizes = [
  { suffix: 'thumb', width: 150, height: 150 },
  { suffix: 'small', width: 400, height: 400 },
  { suffix: 'medium', width: 800, height: 800 },
  { suffix: 'large', width: 1600, height: 1600 },
];

async function uploadWithVariants(file: File, key: string) {
  // Upload original
  await bucket.put(key, file);
  
  // Generate and upload variants
  for (const size of imageSizes) {
    const resized = await resizeImage(file, size.width, size.height);
    await bucket.put(`${key}_${size.suffix}`, resized);
  }
}
```

---

## 12.4 Lazy Loading

### Route-Based Code Splitting

```typescript
// React lazy loading for routes
import { lazy, Suspense } from 'react';

const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Lazy Loading

```tsx
// Lazy load images with IntersectionObserver
export function LazyImage({ src, alt, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          imgRef.current.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return (
    <img
      ref={imgRef}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      className={isLoaded ? 'loaded' : 'loading'}
      {...props}
    />
  );
}
```

---

## 12.5 Error Monitoring

### Sentry Integration

```typescript
// Initialize Sentry
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  },
});
```

### Server-Side Error Tracking

```typescript
// Hono error handler with Sentry
import { Toucan } from 'toucan-js';

app.onError((err, c) => {
  const sentry = new Toucan({
    dsn: c.env.SENTRY_DSN,
    context: c.executionCtx,
    request: c.req.raw,
  });
  
  sentry.setUser({
    id: c.get('user')?.id,
    email: c.get('user')?.email,
  });
  
  sentry.setExtra('organizationId', c.get('organizationId'));
  
  sentry.captureException(err);
  
  return c.json({
    success: false,
    error: 'Internal server error',
    requestId: crypto.randomUUID(),
  }, 500);
});
```

### LogRocket (Optional)

For session replay and debugging:

```typescript
import LogRocket from 'logrocket';

LogRocket.init('pabili/production');

// Identify user
LogRocket.identify(userId, {
  name: user.name,
  email: user.email,
  organizationId: activeOrg.id,
});
```

---

## 12.6 Performance Dashboard

### Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p50) | < 100ms | > 500ms |
| API Response Time (p99) | < 500ms | > 2000ms |
| Error Rate | < 0.1% | > 1% |
| Database Query Time | < 50ms | > 200ms |
| Time to First Byte | < 200ms | > 1000ms |
| Largest Contentful Paint | < 2.5s | > 4s |

### Cloudflare Analytics

Use Cloudflare Analytics for:
- Request counts
- Bandwidth usage
- Cache hit ratio
- Error rates
- Geographic distribution

### Custom Metrics

```typescript
// Track custom metrics with Workers Analytics Engine
app.use('*', async (c, next) => {
  const start = Date.now();
  
  await next();
  
  const duration = Date.now() - start;
  
  // Write to Analytics Engine
  c.env.ANALYTICS.writeDataPoint({
    blobs: [c.req.path, c.req.method],
    doubles: [duration, c.res.status],
    indexes: [c.get('organizationId') || 'anonymous'],
  });
});
```

---

## 12.7 Background Sync (PWA)

### Offline Order Queue

```typescript
// Queue orders when offline
async function createOrder(orderData: OrderInput) {
  if (!navigator.onLine) {
    // Save to IndexedDB for later sync
    await saveToQueue('orders', orderData);
    
    // Register background sync
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-orders');
    
    return { queued: true };
  }
  
  return await api.post('/api/orders', orderData);
}
```

### Background Sync Handler

```javascript
// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  const queue = await getQueue('orders');
  
  for (const order of queue) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order.data),
      });
      await removeFromQueue('orders', order.id);
    } catch (error) {
      // Will retry on next sync event
      console.error('Sync failed:', error);
    }
  }
}
```

---

## Performance Checklist

- [ ] Edge caching configured for static assets
- [ ] Service worker caching strategies implemented
- [ ] Database indexes added for common queries
- [ ] Cursor-based pagination implemented
- [ ] Query batching/JOINs used
- [ ] Image compression on upload
- [ ] Responsive image variants generated
- [ ] Route-based code splitting
- [ ] Image lazy loading
- [ ] Sentry error monitoring
- [ ] Performance metrics dashboard
- [ ] Background sync for offline orders
