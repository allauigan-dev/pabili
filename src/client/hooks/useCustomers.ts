import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { customersApi } from '../lib/api';
import type { Customer, CreateCustomerDto } from '../lib/types';

export function useCustomers() {
    return useApi<Customer[]>(customersApi.list);
}

export function useCustomer(id: number) {
    const fetcher = useCallback(() => customersApi.get(id), [id]);
    const isValidId = !isNaN(id) && id > 0;
    return useApi<Customer>(fetcher, [id], isValidId);
}

export function useCustomerMutations() {
    const create = useMutation<Customer, CreateCustomerDto>(customersApi.create);
    const update = useMutation<Customer, { id: number; data: Partial<CreateCustomerDto> }>(({ id, data }) => customersApi.update(id, data));
    const remove = useMutation<void, number>(customersApi.delete);

    return {
        createAction: create.execute,
        updateAction: update.execute,
        deleteAction: remove.execute,
        loading: create.loading || update.loading || remove.loading,
        error: create.error || update.error || remove.error
    };
}

export function useCustomerBalance(id: number) {
    const fetcher = useCallback(() => customersApi.getBalance(id), [id]);
    const isValidId = !isNaN(id) && id > 0;
    return useApi<{ totalOrders: number; totalPayments: number; balance: number }>(fetcher, [id], isValidId);
}
