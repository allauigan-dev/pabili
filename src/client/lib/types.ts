/**
 * Pabili Frontend Type Definitions
 */

export type OrderStatus = 'pending' | 'bought' | 'packed' | 'delivered' | 'cancelled' | 'no_stock';
export type StoreStatus = 'active' | 'inactive';
export type ResellerStatus = 'active' | 'inactive';
export type PaymentMethod = 'cash' | 'gcash' | 'paymaya' | 'bank_transfer' | 'other';
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type EntityType = 'order' | 'store' | 'reseller' | 'payment' | 'invoice';
export type ImageType = 'primary' | 'logo' | 'cover' | 'proof' | 'gallery' | 'attachment';

export interface Order {
    id: number;
    orderNumber: string;
    userId?: number | null;
    orderName: string;
    orderDescription?: string | null;
    orderQuantity: number;
    orderImage?: string | null;
    orderPrice: number;
    orderFee: number;
    orderResellerPrice: number;
    orderTotal: number;
    orderResellerTotal: number;
    orderStatus: OrderStatus;
    orderDate: string;
    storeId: number;
    resellerId: number;
    invoiceId?: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
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

export interface Reseller {
    id: number;
    resellerName: string;
    resellerAddress?: string | null;
    resellerPhone?: string | null;
    resellerEmail?: string | null;
    resellerPhoto?: string | null;
    resellerDescription?: string | null;
    resellerStatus: ResellerStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
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
    resellerId: number;
    invoiceId?: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    // Joined fields frequently returned by API
    resellerName?: string;
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
    resellerId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    // Joined fields frequently returned by API
    resellerName?: string;
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

export interface CreateOrderDto extends Partial<Omit<Order, 'id' | 'orderNumber' | 'orderTotal' | 'orderResellerTotal' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    orderName: string;
    orderPrice: number;
    orderResellerPrice: number;
    storeId: number;
    resellerId: number;
}

export interface CreateStoreDto extends Partial<Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    storeName: string;
}

export interface CreateResellerDto extends Partial<Omit<Reseller, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    resellerName: string;
}

export interface CreatePaymentDto extends Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    paymentAmount: number;
    resellerId: number;
}

export interface CreateInvoiceDto extends Partial<Omit<Invoice, 'id' | 'invoiceNumber' | 'invoiceBalance' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {
    resellerId: number;
}
