import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '../lib/types';

/**
 * Generic hook for API data fetching
 */
export function useApi<T>(
    fetcher: () => Promise<ApiResponse<T>>,
    deps: any[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
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
    }, [fetcher]);

    useEffect(() => {
        execute();
    }, deps);

    return { data, loading, error, refetch: execute, setData };
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
