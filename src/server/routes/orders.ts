/**
 * Orders API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull, count, or, sql } from 'drizzle-orm';
import { createDb, orders, stores, customers } from '../db';

import type { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';
import { logActivity } from '../lib/activity-logger';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// Validation schemas
// ... (rest of schemas same)
const createOrderSchema = z.object({
    orderName: z.string().min(1, 'Order name is required'),
    orderDescription: z.string().optional(),
    orderQuantity: z.number().int().positive().default(1),
    orderImage: z.string().optional(),
    orderImages: z.array(z.string()).optional(),
    orderPrice: z.number().positive('Price must be positive'),
    orderFee: z.number().nonnegative().default(0),
    orderCustomerPrice: z.number().positive('Customer price must be positive'),
    storeId: z.number().int().positive(),
    customerId: z.number().int().positive(),
    invoiceId: z.number().int().positive().optional(),
});

const updateOrderSchema = createOrderSchema.partial();

const updateStatusSchema = z.object({
    status: z.enum(['pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock']),
});

// Generate order number
function generateOrderNumber() {
    const date = new Date();
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

// GET /api/orders - List orders with pagination and search
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    // Pagination params
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;

    // Search param
    const search = c.req.query('search')?.trim() || '';
    const searchPattern = search ? `%${search}%` : null;

    // Build base where conditions
    const baseConditions = and(
        eq(orders.organizationId, organizationId),
        isNull(orders.deletedAt)
    );

    try {
        // Get total count (with search filter if applicable)
        // For count, we need to do a join if searching
        let total: number;
        if (searchPattern) {
            const [countResult] = await db
                .select({ total: count() })
                .from(orders)
                .leftJoin(stores, eq(orders.storeId, stores.id))
                .leftJoin(customers, eq(orders.customerId, customers.id))
                .where(and(
                    baseConditions,
                    or(
                        sql`LOWER(${orders.orderName}) LIKE LOWER(${searchPattern})`,
                        sql`LOWER(${customers.customerName}) LIKE LOWER(${searchPattern})`,
                        sql`LOWER(${stores.storeName}) LIKE LOWER(${searchPattern})`
                    )
                ));
            total = countResult?.total || 0;
        } else {
            const [countResult] = await db
                .select({ total: count() })
                .from(orders)
                .where(baseConditions);
            total = countResult?.total || 0;
        }

        // Build the main query with optional search filter
        const whereConditions = searchPattern
            ? and(
                baseConditions,
                or(
                    sql`LOWER(${orders.orderName}) LIKE LOWER(${searchPattern})`,
                    sql`LOWER(${customers.customerName}) LIKE LOWER(${searchPattern})`,
                    sql`LOWER(${stores.storeName}) LIKE LOWER(${searchPattern})`
                )
            )
            : baseConditions;

        // Get paginated orders
        const allOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                userId: orders.userId,
                orderName: orders.orderName,
                orderDescription: orders.orderDescription,
                orderQuantity: orders.orderQuantity,
                orderImage: orders.orderImage,
                orderImages: orders.orderImages,
                orderPrice: orders.orderPrice,
                orderFee: orders.orderFee,
                orderCustomerPrice: orders.orderCustomerPrice,
                orderTotal: orders.orderTotal,
                orderCustomerTotal: orders.orderCustomerTotal,
                orderStatus: orders.orderStatus,
                orderDate: orders.orderDate,
                storeId: orders.storeId,
                customerId: orders.customerId,
                invoiceId: orders.invoiceId,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                deletedAt: orders.deletedAt,
                storeName: stores.storeName,
                customerName: customers.customerName,
            })
            .from(orders)
            .leftJoin(stores, eq(orders.storeId, stores.id))
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(whereConditions)
            .orderBy(desc(orders.createdAt), desc(orders.id))
            .limit(limit)
            .offset(offset);

        const ordersWithParsedImages = allOrders.map(order => ({
            ...order,
            orderImages: order.orderImages ? JSON.parse(order.orderImages as string) : []
        }));

        return c.json({
            success: true,
            data: ordersWithParsedImages,
            meta: { page, pageSize: limit, total }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return c.json({ success: false, error: 'Failed to fetch orders' }, 500);
    }
});

// GET /api/orders/counts - Get counts per status
app.get('/counts', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    const statusList = ['pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock'] as const;

    try {
        // Get total count (all non-deleted orders)
        const [totalResult] = await db
            .select({ total: count() })
            .from(orders)
            .where(and(
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ));

        const counts: Record<string, number> = {
            all: totalResult?.total || 0,
        };

        // Get count for each status
        for (const status of statusList) {
            const [result] = await db
                .select({ total: count() })
                .from(orders)
                .where(and(
                    eq(orders.organizationId, organizationId),
                    eq(orders.orderStatus, status),
                    isNull(orders.deletedAt)
                ));
            counts[status] = result?.total || 0;
        }

        return c.json({ success: true, data: counts });
    } catch (error) {
        console.error('Error fetching order counts:', error);
        return c.json({ success: false, error: 'Failed to fetch order counts' }, 500);
    }
});

// GET /api/orders/buy-list - Get pending orders grouped by store
app.get('/buy-list', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    try {
        // Fetch all pending orders with store and customer info
        const pendingOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                orderName: orders.orderName,
                orderDescription: orders.orderDescription,
                orderQuantity: orders.orderQuantity,
                orderImage: orders.orderImage,
                orderImages: orders.orderImages,
                orderPrice: orders.orderPrice,
                orderFee: orders.orderFee,
                orderCustomerPrice: orders.orderCustomerPrice,
                orderTotal: orders.orderTotal,
                orderCustomerTotal: orders.orderCustomerTotal,
                orderStatus: orders.orderStatus,
                orderDate: orders.orderDate,
                storeId: orders.storeId,
                customerId: orders.customerId,
                createdAt: orders.createdAt,
                storeName: stores.storeName,
                storeAddress: stores.storeAddress,
                storeLogo: stores.storeLogo,
                customerName: customers.customerName,
            })
            .from(orders)
            .leftJoin(stores, eq(orders.storeId, stores.id))
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(and(
                eq(orders.organizationId, organizationId),
                eq(orders.orderStatus, 'pending'),
                isNull(orders.deletedAt)
            ))
            .orderBy(stores.storeName, desc(orders.createdAt), desc(orders.id));

        // Group orders by store in application layer
        const storeGroups = new Map<number, {
            store: { id: number; storeName: string | null; storeAddress: string | null; storeLogo: string | null };
            orders: typeof pendingOrders;
            orderCount: number;
            totalItems: number;
        }>();

        for (const order of pendingOrders) {
            const storeId = order.storeId;
            if (!storeGroups.has(storeId)) {
                storeGroups.set(storeId, {
                    store: {
                        id: storeId,
                        storeName: order.storeName,
                        storeAddress: order.storeAddress,
                        storeLogo: order.storeLogo,
                    },
                    orders: [],
                    orderCount: 0,
                    totalItems: 0,
                });
            }

            const group = storeGroups.get(storeId)!;
            group.orders.push({
                ...order,
                orderImages: order.orderImages ? JSON.parse(order.orderImages as string) : [],
            } as typeof order);
            group.orderCount++;
            group.totalItems += order.orderQuantity;
        }

        // Convert map to array
        const buyList = Array.from(storeGroups.values());

        return c.json({ success: true, data: buyList });
    } catch (error) {
        console.error('Error fetching buy list:', error);
        return c.json({ success: false, error: 'Failed to fetch buy list' }, 500);
    }
});

// GET /api/orders/packaging-list - Get bought orders grouped by customer
app.get('/packaging-list', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    try {
        // Fetch all bought orders with customer and store info
        const boughtOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                orderName: orders.orderName,
                orderDescription: orders.orderDescription,
                orderQuantity: orders.orderQuantity,
                orderImage: orders.orderImage,
                orderImages: orders.orderImages,
                orderPrice: orders.orderPrice,
                orderFee: orders.orderFee,
                orderCustomerPrice: orders.orderCustomerPrice,
                orderTotal: orders.orderTotal,
                orderCustomerTotal: orders.orderCustomerTotal,
                orderStatus: orders.orderStatus,
                orderDate: orders.orderDate,
                storeId: orders.storeId,
                customerId: orders.customerId,
                createdAt: orders.createdAt,
                storeName: stores.storeName,
                customerName: customers.customerName,
                customerAddress: customers.customerAddress,
                customerPhoto: customers.customerPhoto,
            })
            .from(orders)
            .leftJoin(stores, eq(orders.storeId, stores.id))
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(and(
                eq(orders.organizationId, organizationId),
                eq(orders.orderStatus, 'bought'),
                isNull(orders.deletedAt)
            ))
            .orderBy(customers.customerName, desc(orders.createdAt), desc(orders.id));

        // Group orders by customer in application layer
        const customerGroups = new Map<number, {
            customer: { id: number; customerName: string; customerAddress: string | null; customerPhoto: string | null };
            orders: typeof boughtOrders;
            orderCount: number;
            totalItems: number;
        }>();

        for (const order of boughtOrders) {
            const customerId = order.customerId;
            if (!customerGroups.has(customerId)) {
                customerGroups.set(customerId, {
                    customer: {
                        id: customerId,
                        customerName: order.customerName || 'Unknown Customer',
                        customerAddress: order.customerAddress,
                        customerPhoto: order.customerPhoto,
                    },
                    orders: [],
                    orderCount: 0,
                    totalItems: 0,
                });
            }

            const group = customerGroups.get(customerId)!;
            group.orders.push({
                ...order,
                orderImages: order.orderImages ? JSON.parse(order.orderImages as string) : [],
            } as typeof order);
            group.orderCount++;
            group.totalItems += order.orderQuantity;
        }

        // Convert map to array
        const packagingList = Array.from(customerGroups.values());

        return c.json({ success: true, data: packagingList });
    } catch (error) {
        console.error('Error fetching packaging list:', error);
        return c.json({ success: false, error: 'Failed to fetch packaging list' }, 500);
    }
});

// GET /api/orders/:id - Get single order
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid order ID' }, 400);
    }

    try {
        const [order] = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                userId: orders.userId,
                orderName: orders.orderName,
                orderDescription: orders.orderDescription,
                orderQuantity: orders.orderQuantity,
                orderImage: orders.orderImage,
                orderImages: orders.orderImages,
                orderPrice: orders.orderPrice,
                orderFee: orders.orderFee,
                orderCustomerPrice: orders.orderCustomerPrice,
                orderTotal: orders.orderTotal,
                orderCustomerTotal: orders.orderCustomerTotal,
                orderStatus: orders.orderStatus,
                orderDate: orders.orderDate,
                storeId: orders.storeId,
                customerId: orders.customerId,
                invoiceId: orders.invoiceId,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                deletedAt: orders.deletedAt,
                storeName: stores.storeName,
                customerName: customers.customerName,
            })
            .from(orders)
            .leftJoin(stores, eq(orders.storeId, stores.id))
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(and(
                eq(orders.id, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ));

        if (!order) {
            return c.json({ success: false, error: 'Order not found' }, 404);
        }

        const orderWithParsedImages = {
            ...order,
            orderImages: order.orderImages ? JSON.parse(order.orderImages as string) : []
        };

        return c.json({ success: true, data: orderWithParsedImages });
    } catch (error) {
        console.error('Error fetching order:', error);
        return c.json({ success: false, error: 'Failed to fetch order' }, 500);
    }
});

// POST /api/orders - Create new order
app.post('/', zValidator('json', createOrderSchema), async (c) => {
    const db = createDb(c.env.DB);
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    try {
        // Calculate totals
        const orderTotal = data.orderQuantity * (data.orderPrice + data.orderFee);
        const orderCustomerTotal = data.orderQuantity * data.orderCustomerPrice;

        const [newOrder] = await db
            .insert(orders)
            .values({
                ...data,
                orderImages: data.orderImages ? JSON.stringify(data.orderImages) : null,
                organizationId,
                orderNumber: generateOrderNumber(),
                orderTotal,
                orderCustomerTotal,
            })
            .returning();

        // Log activity
        await logActivity({
            db,
            organizationId,
            type: 'order',
            action: 'created',
            entityId: newOrder.id,
            title: newOrder.orderName,
            description: `New order created (#${newOrder.orderNumber})`,
            status: newOrder.orderStatus,
        });

        const orderWithParsedImages = {
            ...newOrder,
            orderImages: newOrder.orderImages ? JSON.parse(newOrder.orderImages as string) : []
        };

        return c.json({ success: true, data: orderWithParsedImages }, 201);
    } catch (error) {
        console.error('Error creating order:', error);
        return c.json({ success: false, error: 'Failed to create order' }, 500);
    }
});

// PUT /api/orders/:id - Update order
app.put('/:id', zValidator('json', updateOrderSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid order ID' }, 400);
    }

    try {
        // Recalculate totals if relevant fields changed
        const updateData: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() };

        if (data.orderQuantity !== undefined || data.orderPrice !== undefined || data.orderFee !== undefined || data.orderCustomerPrice !== undefined) {
            // Need to fetch current values to recalculate
            const [current] = await db
                .select()
                .from(orders)
                .where(and(
                    eq(orders.id, id),
                    eq(orders.organizationId, organizationId)
                ));

            if (current) {
                const qty = data.orderQuantity ?? current.orderQuantity;
                const price = data.orderPrice ?? current.orderPrice;
                const fee = data.orderFee ?? current.orderFee;
                const customerPrice = data.orderCustomerPrice ?? current.orderCustomerPrice;

                updateData.orderTotal = qty * (price + fee);
                updateData.orderCustomerTotal = qty * customerPrice;
            }
        }

        const [updatedOrder] = await db
            .update(orders)
            .set({
                ...updateData,
                orderImages: data.orderImages ? JSON.stringify(data.orderImages) : undefined,
            })
            .where(and(
                eq(orders.id, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .returning();

        if (updatedOrder) {
            // Log activity
            await logActivity({
                db,
                organizationId,
                type: 'order',
                action: 'updated',
                entityId: updatedOrder.id,
                title: updatedOrder.orderName,
                description: `Order details modified`,
                status: updatedOrder.orderStatus,
            });
        }

        if (!updatedOrder) {
            return c.json({ success: false, error: 'Order not found' }, 404);
        }

        const orderWithParsedImages = {
            ...updatedOrder,
            orderImages: updatedOrder.orderImages ? JSON.parse(updatedOrder.orderImages as string) : []
        };

        return c.json({ success: true, data: orderWithParsedImages });
    } catch (error) {
        console.error('Error updating order:', error);
        return c.json({ success: false, error: 'Failed to update order' }, 500);
    }
});

// PATCH /api/orders/:id/status - Update order status
app.patch('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const { status } = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid order ID' }, 400);
    }

    try {
        const [updatedOrder] = await db
            .update(orders)
            .set({ orderStatus: status, updatedAt: new Date().toISOString() })
            .where(and(
                eq(orders.id, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .returning();

        if (updatedOrder) {
            // Log activity
            await logActivity({
                db,
                organizationId,
                type: 'order',
                action: 'status_changed',
                entityId: updatedOrder.id,
                title: updatedOrder.orderName,
                description: `Status changed to ${status}`,
                status: status,
            });
        }

        if (!updatedOrder) {
            return c.json({ success: false, error: 'Order not found' }, 404);
        }

        return c.json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        return c.json({ success: false, error: 'Failed to update order status' }, 500);
    }
});

// DELETE /api/orders/:id - Soft delete order
app.delete('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid order ID' }, 400);
    }

    try {
        const [deletedOrder] = await db
            .update(orders)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(orders.id, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .returning();

        if (deletedOrder) {
            // Log activity
            await logActivity({
                db,
                organizationId,
                type: 'order',
                action: 'deleted',
                entityId: deletedOrder.id,
                title: deletedOrder.orderName,
                description: `Order deleted`,
                status: deletedOrder.orderStatus,
            });
        }

        if (!deletedOrder) {
            return c.json({ success: false, error: 'Order not found' }, 404);
        }

        return c.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return c.json({ success: false, error: 'Failed to delete order' }, 500);
    }
});

export default app;

