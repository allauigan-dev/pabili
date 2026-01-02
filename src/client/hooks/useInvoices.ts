import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { invoicesApi } from '../lib/api';
import type { Invoice, CreateInvoiceDto, InvoiceStatus } from '../lib/types';

export function useInvoices() {
    return useApi<Invoice[]>(invoicesApi.list);
}

export function useInvoice(id: number) {
    const fetcher = useCallback(() => invoicesApi.get(id), [id]);
    return useApi<Invoice>(fetcher, [id]);
}

export function useInvoiceMutations() {
    const create = useMutation<Invoice, CreateInvoiceDto>(invoicesApi.create);
    const update = useMutation<Invoice, { id: number; data: Partial<CreateInvoiceDto> }>(({ id, data }) => invoicesApi.update(id, data));
    const updateStatus = useMutation<Invoice, { id: number; status: InvoiceStatus }>(({ id, status }) => invoicesApi.updateStatus(id, status));
    const remove = useMutation<void, number>(invoicesApi.delete);

    return {
        createAction: create.execute,
        updateAction: update.execute,
        updateStatusAction: updateStatus.execute,
        deleteAction: remove.execute,
        loading: create.loading || update.loading || updateStatus.loading || remove.loading,
        error: create.error || update.error || updateStatus.error || remove.error
    };
}
