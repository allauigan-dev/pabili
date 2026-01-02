import type { ApiResponse, Order, Store, Reseller, Payment, Invoice, CreateOrderDto, CreateStoreDto, CreateResellerDto, CreatePaymentDto, CreateInvoiceDto } from './types';

/**
 * Base fetch wrapper for API calls
 */
async function fetchApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || `HTTP error! status: ${response.status}`,
            };
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

/**
 * Orders API
 */
export const ordersApi = {
    list: () => fetchApi<Order[]>('/api/orders'),
    get: (id: number) => fetchApi<Order>(`/api/orders/${id}`),
    create: (data: CreateOrderDto) => fetchApi<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateOrderDto>) => fetchApi<Order>(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    updateStatus: (id: number, status: string) => fetchApi<Order>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
    delete: (id: number) => fetchApi<void>(`/api/orders/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Stores API
 */
export const storesApi = {
    list: () => fetchApi<Store[]>('/api/stores'),
    get: (id: number) => fetchApi<Store>(`/api/stores/${id}`),
    create: (data: CreateStoreDto) => fetchApi<Store>('/api/stores', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateStoreDto>) => fetchApi<Store>(`/api/stores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchApi<void>(`/api/stores/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Resellers API
 */
export const resellersApi = {
    list: () => fetchApi<Reseller[]>('/api/resellers'),
    get: (id: number) => fetchApi<Reseller>(`/api/resellers/${id}`),
    getOrders: (id: number) => fetchApi<Order[]>(`/api/resellers/${id}/orders`),
    getBalance: (id: number) => fetchApi<{ totalOrders: number; totalPayments: number; balance: number }>(`/api/resellers/${id}/balance`),
    create: (data: CreateResellerDto) => fetchApi<Reseller>('/api/resellers', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateResellerDto>) => fetchApi<Reseller>(`/api/resellers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchApi<void>(`/api/resellers/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Payments API
 */
export const paymentsApi = {
    list: () => fetchApi<Payment[]>('/api/payments'),
    get: (id: number) => fetchApi<Payment>(`/api/payments/${id}`),
    create: (data: CreatePaymentDto) => fetchApi<Payment>('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreatePaymentDto>) => fetchApi<Payment>(`/api/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    confirm: (id: number) => fetchApi<Payment>(`/api/payments/${id}/confirm`, {
        method: 'PATCH',
    }),
    delete: (id: number) => fetchApi<void>(`/api/payments/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Invoices API
 */
export const invoicesApi = {
    list: () => fetchApi<Invoice[]>('/api/invoices'),
    get: (id: number) => fetchApi<Invoice>(`/api/invoices/${id}`),
    create: (data: CreateInvoiceDto) => fetchApi<Invoice>('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateInvoiceDto>) => fetchApi<Invoice>(`/api/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    updateStatus: (id: number, status: string) => fetchApi<Invoice>(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
    delete: (id: number) => fetchApi<void>(`/api/invoices/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * File Upload API
 */
export const uploadApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchApi<{ key: string; url: string }>('/api/upload', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header when sending FormData, 
            // the browser will set it with the correct boundary
            headers: {},
        });
    },
    delete: (key: string) => fetchApi<void>(`/api/upload/${key}`, {
        method: 'DELETE',
    }),
};
