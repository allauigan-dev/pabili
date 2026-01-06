import type { ApiResponse, Order, Store, Customer, Payment, Invoice, CreateOrderDto, CreateStoreDto, CreateCustomerDto, CreatePaymentDto, CreateInvoiceDto } from './types';

// ============================================
// API CACHE LAYER
// ============================================

interface CacheEntry<T> {
    data: ApiResponse<T>;
    timestamp: number;
    ttl: number;
}

interface CacheOptions {
    /** Time-to-live in milliseconds. Default: 30000 (30 seconds) */
    ttl?: number;
    /** Skip cache and force network request */
    skipCache?: boolean;
}

// In-memory cache storage
const apiCache = new Map<string, CacheEntry<unknown>>();

// Default TTL: 30 seconds
const DEFAULT_TTL = 30 * 1000;

/**
 * Generate cache key from URL
 */
function getCacheKey(url: string): string {
    return url;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Get cached response if valid
 */
export function getCachedResponse<T>(url: string): ApiResponse<T> | null {
    const key = getCacheKey(url);
    const entry = apiCache.get(key) as CacheEntry<T> | undefined;

    if (entry && isCacheValid(entry)) {
        return entry.data;
    }

    // Remove expired entry
    if (entry) {
        apiCache.delete(key);
    }

    return null;
}

/**
 * Set cached response
 */
function setCacheResponse<T>(url: string, data: ApiResponse<T>, ttl: number): void {
    const key = getCacheKey(url);
    apiCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
    });
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern - URL prefix to match (e.g., '/api/orders' invalidates all order-related cache)
 */
export function invalidateCache(pattern?: string): void {
    if (!pattern) {
        apiCache.clear();
        return;
    }

    for (const key of apiCache.keys()) {
        if (key.startsWith(pattern)) {
            apiCache.delete(key);
        }
    }
}

/**
 * Get all cache keys (for debugging)
 */
export function getCacheKeys(): string[] {
    return Array.from(apiCache.keys());
}

// ============================================
// FETCH API WRAPPER
// ============================================

/**
 * Base fetch wrapper for API calls with caching
 */
async function fetchApi<T>(url: string, options?: RequestInit & CacheOptions): Promise<ApiResponse<T>> {
    const method = options?.method || 'GET';
    const isGetRequest = method === 'GET';
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const ttl = options?.ttl ?? DEFAULT_TTL;
    const skipCache = options?.skipCache ?? false;

    // Check cache for GET requests (unless skipCache is true)
    if (isGetRequest && !skipCache) {
        const cached = getCachedResponse<T>(url);
        if (cached) {
            return cached;
        }
    }

    try {
        // Don't set Content-Type for FormData - browser will set it automatically
        // with the correct multipart boundary
        const isFormData = options?.body instanceof FormData;
        const headers: Record<string, string> = isFormData
            ? {}
            : { 'Content-Type': 'application/json' };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options?.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle validation errors that return an object with issues
            let errorMessage: string;
            if (typeof data.error === 'string') {
                errorMessage = data.error;
            } else if (data.error?.issues) {
                // Zod validation error - extract the first issue message
                errorMessage = data.error.issues[0]?.message || 'Validation failed';
            } else if (data.error) {
                errorMessage = JSON.stringify(data.error);
            } else {
                errorMessage = `HTTP error! status: ${response.status}`;
            }
            return {
                success: false,
                error: errorMessage,
            };
        }

        // Cache successful GET responses
        if (isGetRequest && data.success) {
            setCacheResponse(url, data, ttl);
        }

        // Invalidate related caches on successful mutations
        if (isMutation && data.success) {
            // Extract the base resource path (e.g., /api/orders from /api/orders/1)
            const pathParts = url.split('/');
            const basePath = pathParts.slice(0, 3).join('/'); // /api/resource
            invalidateCache(basePath);

            // Also invalidate related resources that might be affected
            // e.g., when creating an order, customer balance might change
            if (basePath.includes('/orders')) {
                invalidateCache('/api/customers'); // Customer balances may change
            }
            if (basePath.includes('/payments')) {
                invalidateCache('/api/customers'); // Customer balances may change
                invalidateCache('/api/invoices');  // Invoice status may change
            }
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

/**
 * Orders API
 */
export const ordersApi = {
    list: () => fetchApi<Order[]>('/api/orders'),
    listPaginated: (page: number = 1, limit: number = 20) =>
        fetchApi<Order[]>(`/api/orders?page=${page}&limit=${limit}`, { skipCache: true }),
    get: (id: number) => fetchApi<Order>(`/api/orders/${id}`),
    create: (data: CreateOrderDto) => fetchApi<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateOrderDto>) => fetchApi<Order>(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    updateStatus: (id: number, status: string) => fetchApi<Order>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
    delete: (id: number) => fetchApi<void>(`/api/orders/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Stores API
 */
export const storesApi = {
    list: () => fetchApi<Store[]>('/api/stores'),
    listPaginated: (page: number = 1, limit: number = 20) =>
        fetchApi<Store[]>(`/api/stores?page=${page}&limit=${limit}`, { skipCache: true }),
    get: (id: number) => fetchApi<Store>(`/api/stores/${id}`),
    create: (data: CreateStoreDto) => fetchApi<Store>('/api/stores', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateStoreDto>) => fetchApi<Store>(`/api/stores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchApi<void>(`/api/stores/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Customers API
 */
export const customersApi = {
    list: () => fetchApi<Customer[]>('/api/customers'),
    listPaginated: (page: number = 1, limit: number = 20) =>
        fetchApi<Customer[]>(`/api/customers?page=${page}&limit=${limit}`, { skipCache: true }),
    get: (id: number) => fetchApi<Customer>(`/api/customers/${id}`),
    getOrders: (id: number) => fetchApi<Order[]>(`/api/customers/${id}/orders`),
    getBalance: (id: number) => fetchApi<{ totalOrders: number; totalPayments: number; balance: number }>(`/api/customers/${id}/balance`),
    create: (data: CreateCustomerDto) => fetchApi<Customer>('/api/customers', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateCustomerDto>) => fetchApi<Customer>(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchApi<void>(`/api/customers/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Payments API
 */
export const paymentsApi = {
    list: () => fetchApi<Payment[]>('/api/payments'),
    listPaginated: (page: number = 1, limit: number = 20) =>
        fetchApi<Payment[]>(`/api/payments?page=${page}&limit=${limit}`, { skipCache: true }),
    get: (id: number) => fetchApi<Payment>(`/api/payments/${id}`),
    create: (data: CreatePaymentDto) => fetchApi<Payment>('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreatePaymentDto>) => fetchApi<Payment>(`/api/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    confirm: (id: number) => fetchApi<Payment>(`/api/payments/${id}/confirm`, {
        method: 'PATCH',
    }),
    delete: (id: number) => fetchApi<void>(`/api/payments/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Invoices API
 */
export const invoicesApi = {
    list: () => fetchApi<Invoice[]>('/api/invoices'),
    listPaginated: (page: number = 1, limit: number = 20) =>
        fetchApi<Invoice[]>(`/api/invoices?page=${page}&limit=${limit}`, { skipCache: true }),
    get: (id: number) => fetchApi<Invoice>(`/api/invoices/${id}`),
    create: (data: CreateInvoiceDto) => fetchApi<Invoice>('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateInvoiceDto>) => fetchApi<Invoice>(`/api/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    updateStatus: (id: number, status: string) => fetchApi<Invoice>(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
    delete: (id: number) => fetchApi<void>(`/api/invoices/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * File Upload API
 */
export const uploadApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchApi<{ key: string; url: string }>('/api/upload', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header when sending FormData, 
            // the browser will set it with the correct boundary
            headers: {},
        });
    },
    delete: (key: string) => fetchApi<void>(`/api/upload/${key}`, {
        method: 'DELETE',
    }),
};
