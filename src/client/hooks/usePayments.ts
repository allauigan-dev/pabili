import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { paymentsApi } from '../lib/api';
import type { Payment, CreatePaymentDto } from '../lib/types';

export function usePayments() {
    return useApi<Payment[]>(paymentsApi.list);
}

export function usePayment(id: number) {
    const fetcher = useCallback(() => paymentsApi.get(id), [id]);
    return useApi<Payment>(fetcher, [id]);
}

export function usePaymentMutations() {
    const create = useMutation<Payment, CreatePaymentDto>(paymentsApi.create);
    const update = useMutation<Payment, { id: number; data: Partial<CreatePaymentDto> }>(({ id, data }) => paymentsApi.update(id, data));
    const confirm = useMutation<Payment, number>(paymentsApi.confirm);
    const remove = useMutation<void, number>(paymentsApi.delete);

    return {
        createAction: create.execute,
        updateAction: update.execute,
        confirmAction: confirm.execute,
        deleteAction: remove.execute,
        loading: create.loading || update.loading || confirm.loading || remove.loading,
        error: create.error || update.error || confirm.error || remove.error
    };
}
