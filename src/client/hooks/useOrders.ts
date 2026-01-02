import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { ordersApi } from '../lib/api';
import type { Order, CreateOrderDto, OrderStatus } from '../lib/types';

export function useOrders() {
    return useApi<Order[]>(ordersApi.list);
}

export function useOrder(id: number) {
    const fetcher = useCallback(() => ordersApi.get(id), [id]);
    return useApi<Order>(fetcher, [id]);
}

export function useOrderMutations() {
    const create = useMutation<Order, CreateOrderDto>(ordersApi.create);
    const update = useMutation<Order, { id: number; data: Partial<CreateOrderDto> }>(({ id, data }) => ordersApi.update(id, data));
    const updateStatus = useMutation<Order, { id: number; status: OrderStatus }>(({ id, status }) => ordersApi.updateStatus(id, status));
    const remove = useMutation<void, number>(ordersApi.delete);

    return {
        createAction: create.execute,
        updateAction: update.execute,
        updateStatusAction: updateStatus.execute,
        deleteAction: remove.execute,
        loading: create.loading || update.loading || updateStatus.loading || remove.loading,
        error: create.error || update.error || updateStatus.error || remove.error
    };
}
