import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { resellersApi } from '../lib/api';
import type { Reseller, CreateResellerDto } from '../lib/types';

export function useResellers() {
    return useApi<Reseller[]>(resellersApi.list);
}

export function useReseller(id: number) {
    const fetcher = useCallback(() => resellersApi.get(id), [id]);
    const isValidId = !isNaN(id) && id > 0;
    return useApi<Reseller>(fetcher, [id], isValidId);
}

export function useResellerMutations() {
    const create = useMutation<Reseller, CreateResellerDto>(resellersApi.create);
    const update = useMutation<Reseller, { id: number; data: Partial<CreateResellerDto> }>(({ id, data }) => resellersApi.update(id, data));
    const remove = useMutation<void, number>(resellersApi.delete);

    return {
        createAction: create.execute,
        updateAction: update.execute,
        deleteAction: remove.execute,
        loading: create.loading || update.loading || remove.loading,
        error: create.error || update.error || remove.error
    };
}

export function useResellerBalance(id: number) {
    const fetcher = useCallback(() => resellersApi.getBalance(id), [id]);
    const isValidId = !isNaN(id) && id > 0;
    return useApi<{ totalOrders: number; totalPayments: number; balance: number }>(fetcher, [id], isValidId);
}
