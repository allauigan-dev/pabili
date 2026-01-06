import { useState, useEffect, useRef, useCallback } from 'react';
import type { ApiResponse } from '../lib/types';

interface UseInfiniteScrollOptions<T> {
    /**
     * Fetcher function that returns paginated data
     * @param page - Page number (1-indexed)
     * @param limit - Number of items per page
     */
    fetcher: (page: number, limit: number) => Promise<ApiResponse<T[]>>;
    /** Items per page (default: 20) */
    pageSize?: number;
    /** Whether fetching is enabled (default: true) */
    enabled?: boolean;
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
    /** Reset and refetch from page 1 */
    reset: () => void;
    /** Total count of items */
    total: number;
}

/**
 * Hook for infinite scroll with Intersection Observer
 * 
 * Automatically loads more items when the sentinel element 
 * becomes visible in the viewport.
 * 
 * @example
 * ```tsx
 * const { items, isLoading, hasMore, sentinelRef, error } = useInfiniteScroll({
 *     fetcher: (page, limit) => ordersApi.listPaginated(page, limit),
 *     pageSize: 20,
 * });
 * 
 * return (
 *     <div>
 *         {items.map(item => <ItemCard key={item.id} item={item} />)}
 *         <div ref={sentinelRef}>
 *             {isLoading && <Spinner />}
 *         </div>
 *     </div>
 * );
 * ```
 */
export function useInfiniteScroll<T>(
    options: UseInfiniteScrollOptions<T>
): UseInfiniteScrollResult<T> {
    const { fetcher, pageSize = 20, enabled = true } = options;

    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelNodeRef = useRef<HTMLDivElement | null>(null);
    const fetchingRef = useRef(false);

    // Fetch data for a specific page
    const fetchPage = useCallback(async (pageNum: number, isInitial: boolean) => {
        if (fetchingRef.current || !enabled) return;

        fetchingRef.current = true;

        if (isInitial) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        setError(null);

        try {
            const response = await fetcher(pageNum, pageSize);

            if (response.success && response.data) {
                const newItems = response.data;
                const meta = response.meta;

                setItems(prev => isInitial ? newItems : [...prev, ...newItems]);

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
    }, [fetcher, pageSize, enabled, items.length]);

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            fetchPage(1, true);
        }
    }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Reset function to start fresh
    const reset = useCallback(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        setTotal(0);
        fetchingRef.current = false;
        fetchPage(1, true);
    }, [fetchPage]);

    return {
        items,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        sentinelRef,
        reset,
        total,
    };
}
