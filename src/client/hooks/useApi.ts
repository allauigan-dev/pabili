import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '../lib/types';

/**
 * Generic hook for API data fetching with cache awareness
 * 
 * The hook works with the API cache layer to avoid showing loading skeletons
 * when data is already cached. The cache is handled at the API layer, so
 * this hook just needs to handle the async state properly.
 */
export function useApi<T>(
    fetcher: () => Promise<ApiResponse<T>>,
    deps: any[] = [],
    enabled: boolean = true
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const isFirstMount = useRef(true);

    const execute = useCallback(async (showLoading = true) => {
        if (!enabled) return;

        // Only show loading skeleton on first mount or explicit refresh
        if (showLoading && data === null) {
            setLoading(true);
        }
        setError(null);

        try {
            const result = await fetcher();
            if (result.success && result.data !== undefined) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, [fetcher, enabled, data]);

    useEffect(() => {
        // On first mount, fetch data (which will be fast if cached)
        // Show loading only if we don't have data yet
        execute(isFirstMount.current);
        isFirstMount.current = false;
    }, [execute, ...deps]);

    // Refetch function that always shows loading indicator
    const refetch = useCallback(() => {
        setLoading(true);
        return execute(true);
    }, [execute]);

    return { data, loading, error, refetch, setData };
}

/**
 * Generic hook for API mutations
 */
export function useMutation<T, D>(
    mutator: (data: D) => Promise<ApiResponse<T>>
) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = async (data: D): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await mutator(data);
            if (result.success && result.data !== undefined) {
                return result.data;
            } else {
                setError(result.error || 'Operation failed');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { execute, loading, error, setError };
}
