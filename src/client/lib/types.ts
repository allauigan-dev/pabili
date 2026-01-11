/**
 * Pabili Frontend Type Definitions
 */

export type OrderStatus = 'pending' | 'bought' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'no_stock';
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
    shipmentId?: number | null;
    trackingNumber?: string | null;
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

/**
 * Buy List Types - for orders grouped by store
 */
export interface BuyListOrder {
    id: number;
    orderNumber: string;
    orderName: string;
    orderDescription?: string | null;
    orderQuantity: number;
    orderImage?: string | null;
    orderImages?: string[];
    orderPrice: number;
    orderTotal: number | null;
    orderStatus: OrderStatus;
    orderDate: string | null;
    storeId: number;
    customerId: number;
    createdAt: string | null;
    storeName: string | null;
    customerName: string | null;
}

export interface BuyListStoreGroup {
    store: {
        id: number;
        storeName: string | null;
        storeAddress: string | null;
        storeLogo: string | null;
    };
    orders: BuyListOrder[];
    orderCount: number;
    totalItems: number;
}

export interface PackagingListGroup {
    customer: {
        id: number;
        customerName: string;
        customerAddress: string | null;
        customerPhoto: string | null;
    };
    orders: BuyListOrder[];
    orderCount: number;
    totalItems: number;
}

export interface ShippingListGroup {
    customer: {
        id: number;
        customerName: string;
        customerAddress: string | null;
        customerPhone: string | null;
        customerPhoto: string | null;
    };
    orders: BuyListOrder[];
    orderCount: number;
    totalItems: number;
}

/**
 * Shipment Types
 */
export type ShipmentStatus = 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
export type ShipmentCarrier = 'lbc' | 'jt' | 'grab' | 'lalamove' | 'self' | 'other';

export interface Shipment {
    id: number;
    shipmentNumber: string;
    trackingNumber: string;
    carrier: ShipmentCarrier;
    carrierReference?: string | null;
    shipmentStatus: ShipmentStatus;
    shippingFee: number;
    shipmentPhoto?: string | null;
    notes?: string | null;
    customerId: number;
    customerName?: string;
    customerAddress?: string | null;
    customerPhone?: string | null;
    orderCount?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface ShipmentWithOrders extends Shipment {
    orders: {
        id: number;
        orderNumber: string;
        orderName: string;
        orderQuantity: number;
        orderCustomerTotal: number | null;
        orderStatus: OrderStatus;
        orderImage?: string | null;
    }[];
}

export interface CreateShipmentDto {
    customerId: number;
    orderIds: number[];
    carrier?: ShipmentCarrier;
    carrierReference?: string;
    shippingFee?: number;
    notes?: string;
    shipmentPhoto?: string;
}

