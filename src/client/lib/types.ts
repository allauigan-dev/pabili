/**
 * Pabili Frontend Type Definitions
 */

export type OrderStatus = 'pending' | 'bought' | 'packed' | 'delivered' | 'cancelled' | 'no_stock';
export type StoreStatus = 'active' | 'inactive';
export type CustomerStatus = 'active' | 'inactive';
export type PaymentMethod = 'cash' | 'gcash' | 'paymaya' | 'bank_transfer' | 'other';
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type EntityType = 'order' | 'store' | 'customer' | 'payment' | 'invoice';
export type ImageType = 'primary' | 'logo' | 'cover' | 'proof' | 'gallery' | 'attachment';

export interface Order {
    id: number;
    orderNumber: string;
    userId?: number | null;
    orderName: string;
    orderDescription?: string | null;
    orderQuantity: number;
    orderImage?: string | null;
    orderImages?: string[] | null;
    orderPrice: number;
    orderFee: number;
    orderCustomerPrice: number;
    orderTotal: number;
    orderCustomerTotal: number;
    orderStatus: OrderStatus;
    orderDate: string;
    storeId: number;
    customerId: number;
    invoiceId?: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    // Joined fields frequently returned by API
    storeName: string;
    customerName: string;
}

export interface Store {
    id: number;
    storeName: string;
    storeAddress?: string | null;
    storePhone?: string | null;
    storeEmail?: string | null;
    storeLogo?: string | null;
    storeCover?: string | null;
    storeDescription?: string | null;
    storeStatus: StoreStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface Customer {
    id: number;
    organizationId: string;
    customerName: string;
    customerAddress?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    customerPhoto?: string | null;
    customerDescription?: string | null;
    customerStatus: CustomerStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    // Balance fields (returned by list endpoint)
    totalOrders?: number;
    totalPayments?: number;
    balance?: number;
}

export interface Payment {
    id: number;
    paymentAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string | null;
    paymentProof?: string | null;
    paymentNotes?: string | null;
    paymentStatus: PaymentStatus;
    paymentDate: string;
    customerId: number;
    invoiceId?: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    // Joined fields frequently returned by API
    customerName?: string;
    confirmedAt?: string | null;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    invoiceTotal: number;
    invoicePaid: number;
    invoiceBalance: number;
    invoiceNotes?: string | null;
    dueDate?: string | null;
    invoiceStatus: InvoiceStatus;
    customerId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    // Joined fields frequently returned by API
    customerName?: string;
    orderIds?: number[];
}

export interface ImageMetadata {
    id: number;
    r2Key: string;
    r2Url: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    width?: number | null;
    height?: number | null;
    entityType: EntityType;
    entityId: number;
    imageType: ImageType;
    altText?: string | null;
    caption?: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface Activity {
    id: number;
    organizationId: string;
    type: EntityType;
    action: 'created' | 'updated' | 'deleted' | 'status_changed';
    entityId: number;
    title: string;
    description?: string | null;
    status?: string | null;
    userId?: string | null;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        page: number;
        pageSize: number;
        total: number;
    };
}

export interface CreateOrderDto extends Partial<Omit<Order, 'id' | 'orderNumber' | 'orderTotal' | 'orderCustomerTotal' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    orderName: string;
    orderPrice: number;
    orderCustomerPrice: number;
    storeId: number;
    customerId: number;
    orderImages?: string[];
}

export interface CreateStoreDto extends Partial<Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    storeName: string;
}

export interface CreateCustomerDto extends Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'organizationId'>> {
    customerName: string;
}

export interface CreatePaymentDto extends Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    paymentAmount: number;
    customerId: number;
}

export interface CreateInvoiceDto extends Partial<Omit<Invoice, 'id' | 'invoiceNumber' | 'invoiceBalance' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    customerId: number;
}
