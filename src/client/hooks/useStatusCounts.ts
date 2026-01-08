import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '../lib/types';
import { onCacheInvalidate } from '../lib/api';

interface UseStatusCountsOptions {
    /** Fetcher function that returns status counts */
    fetcher: () => Promise<ApiResponse<Record<string, number>>>;
    /** Cache key to identify this resource (e.g., 'orders') */
    cacheKey: string;
    /** List of status values to include (including 'all') */
    statusList: string[];
}

interface UseStatusCountsResult {
    /** Counts per status */
    counts: Record<string, number>;
    /** Whether currently loading */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Refetch counts */
    refetch: () => void;
}

// Cache for status counts
const countsCache = new Map<string, { counts: Record<string, number>; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Hook to fetch status counts from the server
 * 
 * @example
 * ```tsx
 * const { counts, isLoading } = useStatusCounts({
 *     fetcher: ordersApi.getCounts,
 *     cacheKey: 'orders',
 *     statusList: ['all', 'pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock'],
 * });
 * ```
 */
export function useStatusCounts(options: UseStatusCountsOptions): UseStatusCountsResult {
    const { fetcher, cacheKey, statusList } = options;

    // Initialize counts with zeros
    const initialCounts = statusList.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
    }, {} as Record<string, number>);

    // Check for cached data
    const cachedData = countsCache.get(cacheKey);
    const isCacheValid = cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL);

    const [counts, setCounts] = useState<Record<string, number>>(
        isCacheValid ? cachedData.counts : initialCounts
    );
    const [isLoading, setIsLoading] = useState(!isCacheValid);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);
    const mountedRef = useRef(true);

    const fetchCounts = useCallback(async () => {
        if (fetchingRef.current) return;

        fetchingRef.current = true;
        setError(null);

        try {
            const response = await fetcher();

            if (!mountedRef.current) return;

            if (response.success && response.data) {
                setCounts(response.data);
                // Cache the result
                countsCache.set(cacheKey, {
                    counts: response.data,
                    timestamp: Date.now(),
                });
            } else {
                setError(response.error || 'Failed to fetch counts');
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
                fetchingRef.current = false;
            }
        }
    }, [fetcher, cacheKey]);

    // Initial fetch (skip if we have valid cache)
    useEffect(() => {
        mountedRef.current = true;

        if (!isCacheValid) {
            fetchCounts();
        }

        return () => {
            mountedRef.current = false;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Listen for cache invalidation and refetch
    useEffect(() => {
        const unsubscribe = onCacheInvalidate((pattern) => {
            // If the API cache for this resource was invalidated, clear our counts cache too
            if (!pattern || cacheKey.startsWith(pattern.replace('/api/', ''))) {
                countsCache.delete(cacheKey);
                fetchCounts();
            }
        });

        return unsubscribe;
    }, [cacheKey, fetchCounts]);

    const refetch = useCallback(() => {
        countsCache.delete(cacheKey);
        setIsLoading(true);
        fetchCounts();
    }, [cacheKey, fetchCounts]);

    return {
        counts,
        isLoading,
        error,
        refetch,
    };
}
