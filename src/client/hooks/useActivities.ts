import { useEffect } from 'react';
import { useApi } from './useApi';
import { activitiesApi, onCacheInvalidate } from '../lib/api';
import type { Activity } from '../lib/types';

export function useActivities(limit: number = 50) {
    const query = useApi<Activity[]>(() => activitiesApi.list(limit), [limit]);
    const { refetch } = query;

    useEffect(() => {
        // Subscribe to cache invalidation
        const unsubscribe = onCacheInvalidate((pattern) => {
            if (pattern === '' || pattern.startsWith('/api/activities')) {
                refetch();
            }
        });
        return unsubscribe;
    }, [refetch]);

    return query;
}
