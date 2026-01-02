/**
 * Pabili Database Schema
 * Drizzle ORM schema definitions for D1 (SQLite)
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// ============================================
// STORES TABLE
// ============================================
export const stores = sqliteTable('stores', {
    id: integer('id').primaryKey({ autoIncrement: true }),

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
]);

// ============================================
// RESELLERS TABLE
// ============================================
export const resellers = sqliteTable('resellers', {
    id: integer('id').primaryKey({ autoIncrement: true }),

    // Reseller Info
    resellerName: text('reseller_name').notNull(),
    resellerAddress: text('reseller_address'),
    resellerPhone: text('reseller_phone'),
    resellerEmail: text('reseller_email'),

    // Media
    resellerPhoto: text('reseller_photo'),
    resellerDescription: text('reseller_description'),

    // Status
    resellerStatus: text('reseller_status', { enum: ['active', 'inactive'] }).notNull().default('active'),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_resellers_status').on(table.resellerStatus),
]);

// ============================================
// INVOICES TABLE
// ============================================
export const invoices = sqliteTable('invoices', {
    id: integer('id').primaryKey({ autoIncrement: true }),

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
    resellerId: integer('reseller_id').notNull().references(() => resellers.id),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_invoices_reseller').on(table.resellerId),
    index('idx_invoices_status').on(table.invoiceStatus),
    index('idx_invoices_due_date').on(table.dueDate),
]);

// ============================================
// ORDERS TABLE
// ============================================
export const orders = sqliteTable('orders', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderNumber: text('order_number').notNull().unique(),
    userId: integer('user_id'),

    // Order Details
    orderName: text('order_name').notNull(),
    orderDescription: text('order_description'),
    orderQuantity: integer('order_quantity').notNull().default(1),
    orderImage: text('order_image'),

    // Pricing
    orderPrice: real('order_price').notNull(),         // Cost per unit
    orderFee: real('order_fee').notNull().default(0),  // Fee per unit
    orderResellerPrice: real('order_reseller_price').notNull(), // Reseller price per unit

    // Calculated totals (stored for performance)
    orderTotal: real('order_total'),           // quantity * (price + fee)
    orderResellerTotal: real('order_reseller_total'), // quantity * reseller_price

    // Status
    orderStatus: text('order_status', {
        enum: ['pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock']
    }).notNull().default('pending'),
    orderDate: text('order_date').default(sql`CURRENT_TIMESTAMP`),

    // Relations
    storeId: integer('store_id').notNull().references(() => stores.id),
    resellerId: integer('reseller_id').notNull().references(() => resellers.id),
    invoiceId: integer('invoice_id').references(() => invoices.id),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_orders_status').on(table.orderStatus),
    index('idx_orders_reseller').on(table.resellerId),
    index('idx_orders_store').on(table.storeId),
    index('idx_orders_date').on(table.orderDate),
]);

// ============================================
// PAYMENTS TABLE
// ============================================
export const payments = sqliteTable('payments', {
    id: integer('id').primaryKey({ autoIncrement: true }),

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
    resellerId: integer('reseller_id').notNull().references(() => resellers.id),
    invoiceId: integer('invoice_id').references(() => invoices.id),

    // Timestamps
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
}, (table) => [
    index('idx_payments_reseller').on(table.resellerId),
    index('idx_payments_status').on(table.paymentStatus),
    index('idx_payments_date').on(table.paymentDate),
]);

// ============================================
// IMAGES TABLE (R2 Integration)
// ============================================
export const images = sqliteTable('images', {
    id: integer('id').primaryKey({ autoIncrement: true }),

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
        enum: ['order', 'store', 'reseller', 'payment', 'invoice']
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
]);

// ============================================
// TYPE EXPORTS
// ============================================
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Reseller = typeof resellers.$inferSelect;
export type NewReseller = typeof resellers.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
