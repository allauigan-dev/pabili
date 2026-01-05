/**
 * Orders API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { createDb, orders, stores, resellers } from '../db';

import { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

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
    orderPrice: z.number().positive('Price must be positive'),
    orderFee: z.number().nonnegative().default(0),
    orderResellerPrice: z.number().positive('Reseller price must be positive'),
    storeId: z.number().int().positive(),
    resellerId: z.number().int().positive(),
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

// GET /api/orders - List all orders
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    try {
        const allOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                userId: orders.userId,
                orderName: orders.orderName,
                orderDescription: orders.orderDescription,
                orderQuantity: orders.orderQuantity,
                orderImage: orders.orderImage,
                orderPrice: orders.orderPrice,
                orderFee: orders.orderFee,
                orderResellerPrice: orders.orderResellerPrice,
                orderTotal: orders.orderTotal,
                orderResellerTotal: orders.orderResellerTotal,
                orderStatus: orders.orderStatus,
                orderDate: orders.orderDate,
                storeId: orders.storeId,
                resellerId: orders.resellerId,
                invoiceId: orders.invoiceId,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                deletedAt: orders.deletedAt,
                storeName: stores.storeName,
                resellerName: resellers.resellerName,
            })
            .from(orders)
            .leftJoin(stores, eq(orders.storeId, stores.id))
            .leftJoin(resellers, eq(orders.resellerId, resellers.id))
            .where(and(
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .orderBy(desc(orders.createdAt));

        return c.json({ success: true, data: allOrders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return c.json({ success: false, error: 'Failed to fetch orders' }, 500);
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
                orderPrice: orders.orderPrice,
                orderFee: orders.orderFee,
                orderResellerPrice: orders.orderResellerPrice,
                orderTotal: orders.orderTotal,
                orderResellerTotal: orders.orderResellerTotal,
                orderStatus: orders.orderStatus,
                orderDate: orders.orderDate,
                storeId: orders.storeId,
                resellerId: orders.resellerId,
                invoiceId: orders.invoiceId,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                deletedAt: orders.deletedAt,
                storeName: stores.storeName,
                resellerName: resellers.resellerName,
            })
            .from(orders)
            .leftJoin(stores, eq(orders.storeId, stores.id))
            .leftJoin(resellers, eq(orders.resellerId, resellers.id))
            .where(and(
                eq(orders.id, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ));

        if (!order) {
            return c.json({ success: false, error: 'Order not found' }, 404);
        }

        return c.json({ success: true, data: order });
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
        const orderResellerTotal = data.orderQuantity * data.orderResellerPrice;

        const [newOrder] = await db
            .insert(orders)
            .values({
                ...data,
                organizationId,
                orderNumber: generateOrderNumber(),
                orderTotal,
                orderResellerTotal,
            })
            .returning();

        return c.json({ success: true, data: newOrder }, 201);
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

        if (data.orderQuantity !== undefined || data.orderPrice !== undefined || data.orderFee !== undefined) {
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
                const resellerPrice = data.orderResellerPrice ?? current.orderResellerPrice;

                updateData.orderTotal = qty * (price + fee);
                updateData.orderResellerTotal = qty * resellerPrice;
            }
        }

        const [updatedOrder] = await db
            .update(orders)
            .set(updateData)
            .where(and(
                eq(orders.id, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .returning();

        if (!updatedOrder) {
            return c.json({ success: false, error: 'Order not found' }, 404);
        }

        return c.json({ success: true, data: updatedOrder });
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
