import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// ============================================
// BETTER AUTH TABLES
// ============================================

export const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id),
    activeOrganizationId: text('active_organization_id'),
});

export const account = sqliteTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ============================================
// ORGANIZATION PLUGIN TABLES
// ============================================

export const organization = sqliteTable('organization', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug'), // Removed unique constraint - slug uniqueness achieved via user-specific suffix
    logo: text('logo'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    metadata: text('metadata'),
    createdBy: text('created_by').references(() => user.id), // Track creator for subscription tier limits
}, (table) => [
    index('idx_organization_created_by').on(table.createdBy),
]);

export const member = sqliteTable('member', {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull().references(() => organization.id),
    userId: text('user_id').notNull().references(() => user.id),
    role: text('role').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const invitation = sqliteTable('invitation', {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull().references(() => organization.id),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    inviterId: text('user_id').notNull().references(() => user.id),
});

// ============================================
// STORES TABLE
// ============================================
export const stores = sqliteTable('stores', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id),

    // Store Info
    storeName: text('store_name').notNull(),
    storeAddress: text('store_address'),
    storePhone: text('store_phone'),
    storeEmail: text('store_email'),

    // Media
    storeLogo: text('store_logo'),
    storeCover: text('store_cover'),
    storeDescription: text('store_description'),

    // Status
    storeStatus: text('store_status', { enum: ['active', 'inactive'] }).notNull().default('active'),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_stores_status').on(table.storeStatus),
    index('idx_stores_org').on(table.organizationId),
]);

// ============================================
// CUSTOMERS TABLE
// ============================================
export const customers = sqliteTable('customers', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id),

    // Customer Info
    customerName: text('customer_name').notNull(),
    customerAddress: text('customer_address'),
    customerPhone: text('customer_phone'),
    customerEmail: text('customer_email'),

    // Media
    customerPhoto: text('customer_photo'),
    customerDescription: text('customer_description'),

    // Status
    customerStatus: text('customer_status', { enum: ['active', 'inactive'] }).notNull().default('active'),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_customers_status').on(table.customerStatus),
    index('idx_customers_org').on(table.organizationId),
]);

// ============================================
// INVOICES TABLE
// ============================================
export const invoices = sqliteTable('invoices', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id),

    // Invoice Info
    invoiceNumber: text('invoice_number').notNull().unique(),
    invoiceTotal: real('invoice_total').notNull().default(0),
    invoicePaid: real('invoice_paid').notNull().default(0),
    invoiceNotes: text('invoice_notes'),
    dueDate: text('due_date'),

    // Status
    invoiceStatus: text('invoice_status', {
        enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']
    }).notNull().default('draft'),

    // Relations
    customerId: integer('customer_id').notNull().references(() => customers.id),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_invoices_customer').on(table.customerId),
    index('idx_invoices_status').on(table.invoiceStatus),
    index('idx_invoices_due_date').on(table.dueDate),
    index('idx_invoices_org').on(table.organizationId),
]);

// ============================================
// ORDERS TABLE
// ============================================
export const orders = sqliteTable('orders', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id),
    orderNumber: text('order_number').notNull().unique(),
    userId: integer('user_id'),

    // Order Details
    orderName: text('order_name').notNull(),
    orderDescription: text('order_description'),
    orderQuantity: integer('order_quantity').notNull().default(1),
    orderImage: text('order_image'),
    orderImages: text('order_images'), // JSON array of strings

    // Pricing
    orderPrice: real('order_price').notNull(),         // Cost per unit
    orderFee: real('order_fee').notNull().default(0),  // Fee per unit
    orderCustomerPrice: real('order_customer_price').notNull(), // Customer price per unit

    // Calculated totals (stored for performance)
    orderTotal: real('order_total'),           // quantity * (price + fee)
    orderCustomerTotal: real('order_customer_total'), // quantity * customer_price

    // Status
    orderStatus: text('order_status', {
        enum: ['pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock']
    }).notNull().default('pending'),
    orderDate: text('order_date').default(sql`CURRENT_TIMESTAMP`),

    // Relations
    storeId: integer('store_id').notNull().references(() => stores.id),
    customerId: integer('customer_id').notNull().references(() => customers.id),
    invoiceId: integer('invoice_id').references(() => invoices.id),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_orders_status').on(table.orderStatus),
    index('idx_orders_customer').on(table.customerId),
    index('idx_orders_store').on(table.storeId),
    index('idx_orders_date').on(table.orderDate),
    index('idx_orders_org').on(table.organizationId),
]);

// ============================================
// PAYMENTS TABLE
// ============================================
export const payments = sqliteTable('payments', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id),

    // Payment Info
    paymentAmount: real('payment_amount').notNull(),
    paymentMethod: text('payment_method', {
        enum: ['cash', 'gcash', 'paymaya', 'bank_transfer', 'other']
    }).notNull().default('cash'),
    paymentReference: text('payment_reference'),
    paymentProof: text('payment_proof'),  // R2 URL for receipt image
    paymentNotes: text('payment_notes'),

    // Status
    paymentStatus: text('payment_status', {
        enum: ['pending', 'confirmed', 'rejected']
    }).notNull().default('pending'),
    paymentDate: text('payment_date').default(sql`CURRENT_TIMESTAMP`),

    // Relations
    customerId: integer('customer_id').notNull().references(() => customers.id),
    invoiceId: integer('invoice_id').references(() => invoices.id),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_payments_customer').on(table.customerId),
    index('idx_payments_status').on(table.paymentStatus),
    index('idx_payments_date').on(table.paymentDate),
    index('idx_payments_org').on(table.organizationId),
]);

// ============================================
// IMAGES TABLE (R2 Integration)
// ============================================
export const images = sqliteTable('images', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id),

    // R2 Storage Info
    r2Key: text('r2_key').notNull().unique(),
    r2Url: text('r2_url').notNull(),

    // File Metadata
    originalFilename: text('original_filename').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    width: integer('width'),
    height: integer('height'),

    // Polymorphic Association
    entityType: text('entity_type', {
        enum: ['order', 'store', 'customer', 'payment', 'invoice']
    }).notNull(),
    entityId: integer('entity_id').notNull(),
    imageType: text('image_type', {
        enum: ['primary', 'logo', 'cover', 'proof', 'gallery', 'attachment']
    }).notNull().default('primary'),

    // Optional metadata
    altText: text('alt_text'),
    caption: text('caption'),
    sortOrder: integer('sort_order').default(0),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_images_entity').on(table.entityType, table.entityId),
    index('idx_images_r2_key').on(table.r2Key),
    index('idx_images_type').on(table.imageType),
    index('idx_images_org').on(table.organizationId),
]);

// ============================================
// ACTIVITIES TABLE (Activity Log)
// ============================================
export const activities = sqliteTable('activities', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id),

    // Activity Info
    type: text('type', {
        enum: ['order', 'store', 'customer', 'payment', 'invoice']
    }).notNull(),
    action: text('action', {
        enum: ['created', 'updated', 'deleted', 'status_changed']
    }).notNull(),
    entityId: integer('entity_id').notNull(),

    // Display Info
    title: text('title').notNull(),
    description: text('description'),
    status: text('status'),

    // Metadata
    userId: text('user_id').references(() => user.id),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
    index('idx_activities_org').on(table.organizationId),
    index('idx_activities_type').on(table.type),
    index('idx_activities_date').on(table.createdAt),
]);

// ============================================
// TYPE EXPORTS
// ============================================
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

