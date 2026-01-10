import { useState, useEffect, useRef, useCallback } from 'react';
import type { ApiResponse } from '../lib/types';
import { onCacheInvalidate } from '../lib/api';

// ============================================
// GLOBAL SCROLL CACHE
// Persists loaded items across navigation
// ============================================

interface ScrollCacheEntry<T> {
    items: T[];
    page: number;
    hasMore: boolean;
    total: number;
    timestamp: number;
}

// Global cache for scroll state - persists across component unmounts
const scrollCache = new Map<string, ScrollCacheEntry<unknown>>();

// Cache TTL: 5 minutes (matches API cache)
const SCROLL_CACHE_TTL = 5 * 60 * 1000;

/**
 * Get cached scroll state if valid
 */
function getScrollCache<T>(key: string): ScrollCacheEntry<T> | null {
    const entry = scrollCache.get(key) as ScrollCacheEntry<T> | undefined;
    if (entry && Date.now() - entry.timestamp < SCROLL_CACHE_TTL) {
        return entry;
    }
    if (entry) {
        scrollCache.delete(key);
    }
    return null;
}

/**
 * Set scroll cache
 */
function setScrollCache<T>(key: string, data: Omit<ScrollCacheEntry<T>, 'timestamp'>): void {
    scrollCache.set(key, {
        ...data,
        timestamp: Date.now(),
    });
}

/**
 * Clear scroll cache for a pattern
 */
export function invalidateScrollCache(pattern?: string): void {
    if (!pattern) {
        scrollCache.clear();
        return;
    }
    for (const key of scrollCache.keys()) {
        if (key.startsWith(pattern)) {
            scrollCache.delete(key);
        }
    }
}

interface UseInfiniteScrollOptions<T> {
    /**
     * Fetcher function that returns paginated data
     * @param page - Page number (1-indexed)
     * @param limit - Number of items per page
     * @param search - Optional search query
     */
    fetcher: (page: number, limit: number, search: string) => Promise<ApiResponse<T[]>>;
    /** Unique cache key for this list (e.g., 'orders', 'stores') */
    cacheKey?: string;
    /** Items per page (default: 20) */
    pageSize?: number;
    /** Whether fetching is enabled (default: true) */
    enabled?: boolean;
    /** Search query to filter results (default: '') */
    search?: string;
}

interface UseInfiniteScrollResult<T> {
    /** All loaded items */
    items: T[];
    /** Whether currently loading */
    isLoading: boolean;
    /** Whether loading more (not initial load) */
    isLoadingMore: boolean;
    /** Whether there are more items to load */
    hasMore: boolean;
    /** Error message if any */
    error: string | null;
    /** Ref to attach to sentinel element */
    sentinelRef: (node: HTMLDivElement | null) => void;
    /** Reset and refetch from page 1 (clears data first) */
    reset: () => void;
    /** Refetch from page 1 without clearing existing data (use for mutations) */
    refetch: () => void;
    /** Total count of items */
    total: number;
}

/**
 * Hook for infinite scroll with Intersection Observer
 * 
 * Automatically loads more items when the sentinel element 
 * becomes visible in the viewport.
 * 
 * Features:
 * - Persists loaded items across navigation (via cacheKey)
 * - Auto-invalidates when related API data changes
 * - Supports server-side search
 * 
 * @example
 * ```tsx
 * const { items, isLoading, hasMore, sentinelRef, error } = useInfiniteScroll({
 *     fetcher: (page, limit, search) => ordersApi.listPaginated(page, limit, search),
 *     cacheKey: 'orders',
 *     pageSize: 20,
 *     search: searchQuery,
 * });
 * ```
 */
export function useInfiniteScroll<T>(
    options: UseInfiniteScrollOptions<T>
): UseInfiniteScrollResult<T> {
    const { fetcher, cacheKey, pageSize = 20, enabled = true, search = '' } = options;

    // Include search in cache key to separate cached results per search term
    const effectiveCacheKey = cacheKey ? (search ? `${cacheKey}:${search}` : cacheKey) : undefined;

    // Try to restore from cache on initial mount
    const cachedData = effectiveCacheKey ? getScrollCache<T>(effectiveCacheKey) : null;

    const [items, setItems] = useState<T[]>(cachedData?.items ?? []);
    const [page, setPage] = useState(cachedData?.page ?? 1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(cachedData?.hasMore ?? true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(cachedData?.total ?? 0);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelNodeRef = useRef<HTMLDivElement | null>(null);
    const fetchingRef = useRef(false);
    const initializedRef = useRef(!!cachedData); // Skip initial fetch if we have cached data
    const currentSearchRef = useRef(search); // Track current search to detect changes

    // Save to scroll cache whenever items change
    useEffect(() => {
        if (effectiveCacheKey && items.length > 0) {
            setScrollCache(effectiveCacheKey, { items, page, hasMore, total });
        }
    }, [effectiveCacheKey, items, page, hasMore, total]);

    // Listen for API cache invalidation and clear scroll cache accordingly
    useEffect(() => {
        if (!cacheKey) return;

        const unsubscribe = onCacheInvalidate((pattern) => {
            // If the API cache for this resource was invalidated, clear scroll cache too
            if (!pattern || cacheKey.startsWith(pattern.replace('/api/', ''))) {
                scrollCache.delete(cacheKey);
            }
        });

        return unsubscribe;
    }, [cacheKey]);

    // Fetch data for a specific page
    const fetchPage = useCallback(async (pageNum: number, isInitial: boolean, showLoading: boolean = true) => {
        if (fetchingRef.current || !enabled) return;

        fetchingRef.current = true;

        // Only show loading if explicitly requested and we have no data
        if (isInitial && showLoading && items.length === 0) {
            setIsLoading(true);
        } else if (!isInitial) {
            setIsLoadingMore(true);
        }
        setError(null);

        try {
            const response = await fetcher(pageNum, pageSize, search);

            if (response.success && response.data) {
                const newItems = response.data;
                const meta = response.meta;

                setItems(prev => {
                    if (isInitial) return newItems;
                    // Deduplicate items to prevent React key warnings if backend returns overlapping items
                    // Most entities in our system have an 'id' property
                    const existingIds = new Set(prev.map((item: any) => item.id));
                    const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item.id));
                    return [...prev, ...uniqueNewItems];
                });

                if (meta) {
                    setTotal(meta.total);
                    // Check if we've loaded all items
                    const totalLoaded = isInitial ? newItems.length : items.length + newItems.length;
                    setHasMore(totalLoaded < meta.total);
                } else {
                    // Fallback: if no meta, check if we got fewer items than requested
                    setHasMore(newItems.length >= pageSize);
                }

                setPage(pageNum);
            } else {
                setError(response.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            fetchingRef.current = false;
        }
    }, [fetcher, pageSize, enabled, items.length, search]);

    // Initial fetch - only if we don't have cached data
    useEffect(() => {
        if (enabled && !initializedRef.current) {
            initializedRef.current = true;
            fetchPage(1, true, true);
        }
    }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset when search changes
    useEffect(() => {
        if (currentSearchRef.current !== search) {
            currentSearchRef.current = search;
            // Clear cache and reset state
            setItems([]);
            setPage(1);
            setHasMore(true);
            setError(null);
            setTotal(0);
            fetchingRef.current = false;
            initializedRef.current = true; // Mark as initialized to avoid double fetch
            fetchPage(1, true, true);
        }
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    // Set up Intersection Observer
    const sentinelRef = useCallback((node: HTMLDivElement | null) => {
        sentinelNodeRef.current = node;

        // Disconnect previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (!node || !hasMore || isLoading || isLoadingMore) {
            return;
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !fetchingRef.current) {
                    fetchPage(page + 1, false);
                }
            },
            {
                root: null,
                rootMargin: '100px', // Trigger slightly before reaching bottom
                threshold: 0.1,
            }
        );

        observerRef.current.observe(node);
    }, [hasMore, isLoading, isLoadingMore, page, fetchPage]);

    // Cleanup observer on unmount
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // Reset function to start fresh (clears data first - use for hard refresh)
    const reset = useCallback(() => {
        // Clear scroll cache for this key
        if (effectiveCacheKey) {
            scrollCache.delete(effectiveCacheKey);
        }
        setItems([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        setTotal(0);
        fetchingRef.current = false;
        initializedRef.current = false;
        fetchPage(1, true, true);
    }, [effectiveCacheKey, fetchPage]);

    // Refetch function - fetches fresh data without clearing existing items first
    // This prevents the flash of empty state during mutations like status changes
    const refetch = useCallback(() => {
        // Clear scroll cache for this key
        if (effectiveCacheKey) {
            scrollCache.delete(effectiveCacheKey);
        }
        setPage(1);
        setHasMore(true);
        setError(null);
        fetchingRef.current = false;
        initializedRef.current = true;
        // Fetch without showing loading and without clearing items
        fetchPage(1, true, false);
    }, [effectiveCacheKey, fetchPage]);

    return {
        items,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        sentinelRef,
        reset,
        refetch,
        total,
    };
}
