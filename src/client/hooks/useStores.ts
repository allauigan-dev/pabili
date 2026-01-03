import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { storesApi } from '../lib/api';
import type { Store, CreateStoreDto } from '../lib/types';

export function useStores() {
    return useApi<Store[]>(storesApi.list);
}

export function useStore(id: number) {
    const fetcher = useCallback(() => storesApi.get(id), [id]);
    const isValidId = !isNaN(id) && id > 0;
    return useApi<Store>(fetcher, [id], isValidId);
}

export function useStoreMutations() {
    const create = useMutation<Store, CreateStoreDto>(storesApi.create);
    const update = useMutation<Store, { id: number; data: Partial<CreateStoreDto> }>(({ id, data }) => storesApi.update(id, data));
    const remove = useMutation<void, number>(storesApi.delete);

    return {
        createAction: create.execute,
        updateAction: update.execute,
        deleteAction: remove.execute,
        loading: create.loading || update.loading || remove.loading,
        error: create.error || update.error || remove.error
    };
}
