/**
 * Shipments API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull, count, inArray } from 'drizzle-orm';
import { createDb, shipments, orders, customers, organization } from '../db';

import type { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';
import { logActivity } from '../lib/activity-logger';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// Validation schemas
const createShipmentSchema = z.object({
    customerId: z.number().int().positive(),
    orderIds: z.array(z.number().int().positive()).min(1, 'At least one order is required'),
    carrier: z.enum(['lbc', 'jt', 'grab', 'lalamove', 'self', 'other']).default('self'),
    carrierReference: z.string().optional(),
    shippingFee: z.number().nonnegative().default(0),
    notes: z.string().optional(),
    shipmentPhoto: z.string().optional(),
});

const updateShipmentSchema = z.object({
    carrier: z.enum(['lbc', 'jt', 'grab', 'lalamove', 'self', 'other']).optional(),
    carrierReference: z.string().optional(),
    shippingFee: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    shipmentPhoto: z.string().optional(),
});

const updateStatusSchema = z.object({
    status: z.enum(['preparing', 'ready', 'in_transit', 'delivered', 'cancelled']),
});

const addOrdersSchema = z.object({
    orderIds: z.array(z.number().int().positive()).min(1),
});

// Generate shipment number
function generateShipmentNumber() {
    const date = new Date();
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SHP-${timestamp}-${random}`;
}

// Generate tracking number with org prefix
async function generateTrackingNumber(db: ReturnType<typeof createDb>, organizationId: string): Promise<string> {
    // Get org slug for prefix
    const [org] = await db
        .select({ slug: organization.slug, name: organization.name })
        .from(organization)
        .where(eq(organization.id, organizationId));

    // Use first 4 chars of slug or name, or default to 'SHP'
    const prefix = (org?.slug || org?.name || 'SHP')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4);

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `${prefix}-${date}-${random}`;
}

// GET /api/shipments - List shipments with pagination
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    // Pagination params
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;

    // Status filter
    const status = c.req.query('status');

    // Build where conditions
    const baseConditions = and(
        eq(shipments.organizationId, organizationId),
        isNull(shipments.deletedAt),
        status ? eq(shipments.shipmentStatus, status as typeof shipments.shipmentStatus.enumValues[number]) : undefined
    );

    try {
        // Get total count
        const [countResult] = await db
            .select({ total: count() })
            .from(shipments)
            .where(baseConditions);
        const total = countResult?.total || 0;

        // Get paginated shipments with customer info
        const allShipments = await db
            .select({
                id: shipments.id,
                shipmentNumber: shipments.shipmentNumber,
                trackingNumber: shipments.trackingNumber,
                carrier: shipments.carrier,
                carrierReference: shipments.carrierReference,
                shipmentStatus: shipments.shipmentStatus,
                shippingFee: shipments.shippingFee,
                shipmentPhoto: shipments.shipmentPhoto,
                notes: shipments.notes,
                customerId: shipments.customerId,
                customerName: customers.customerName,
                customerAddress: customers.customerAddress,
                createdAt: shipments.createdAt,
                updatedAt: shipments.updatedAt,
            })
            .from(shipments)
            .leftJoin(customers, eq(shipments.customerId, customers.id))
            .where(baseConditions)
            .orderBy(desc(shipments.createdAt), desc(shipments.id))
            .limit(limit)
            .offset(offset);

        // Get order counts for each shipment
        const shipmentsWithCounts = await Promise.all(
            allShipments.map(async (shipment) => {
                const [orderCount] = await db
                    .select({ count: count() })
                    .from(orders)
                    .where(and(
                        eq(orders.shipmentId, shipment.id),
                        isNull(orders.deletedAt)
                    ));
                return {
                    ...shipment,
                    orderCount: orderCount?.count || 0,
                };
            })
        );

        return c.json({
            success: true,
            data: shipmentsWithCounts,
            meta: { page, pageSize: limit, total }
        });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return c.json({ success: false, error: 'Failed to fetch shipments' }, 500);
    }
});

// GET /api/shipments/counts - Get counts per status
app.get('/counts', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    const statusList = ['preparing', 'ready', 'in_transit', 'delivered', 'cancelled'] as const;

    try {
        // Get total count
        const [totalResult] = await db
            .select({ total: count() })
            .from(shipments)
            .where(and(
                eq(shipments.organizationId, organizationId),
                isNull(shipments.deletedAt)
            ));

        const counts: Record<string, number> = {
            all: totalResult?.total || 0,
        };

        // Get count for each status
        for (const status of statusList) {
            const [result] = await db
                .select({ total: count() })
                .from(shipments)
                .where(and(
                    eq(shipments.organizationId, organizationId),
                    eq(shipments.shipmentStatus, status),
                    isNull(shipments.deletedAt)
                ));
            counts[status] = result?.total || 0;
        }

        return c.json({ success: true, data: counts });
    } catch (error) {
        console.error('Error fetching shipment counts:', error);
        return c.json({ success: false, error: 'Failed to fetch shipment counts' }, 500);
    }
});

// GET /api/shipments/:id - Get single shipment with orders
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid shipment ID' }, 400);
    }

    try {
        // Get shipment with customer info
        const [shipment] = await db
            .select({
                id: shipments.id,
                shipmentNumber: shipments.shipmentNumber,
                trackingNumber: shipments.trackingNumber,
                carrier: shipments.carrier,
                carrierReference: shipments.carrierReference,
                shipmentStatus: shipments.shipmentStatus,
                shippingFee: shipments.shippingFee,
                shipmentPhoto: shipments.shipmentPhoto,
                notes: shipments.notes,
                customerId: shipments.customerId,
                customerName: customers.customerName,
                customerAddress: customers.customerAddress,
                customerPhone: customers.customerPhone,
                createdAt: shipments.createdAt,
                updatedAt: shipments.updatedAt,
            })
            .from(shipments)
            .leftJoin(customers, eq(shipments.customerId, customers.id))
            .where(and(
                eq(shipments.id, id),
                eq(shipments.organizationId, organizationId),
                isNull(shipments.deletedAt)
            ));

        if (!shipment) {
            return c.json({ success: false, error: 'Shipment not found' }, 404);
        }

        // Get orders in this shipment
        const shipmentOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                orderName: orders.orderName,
                orderQuantity: orders.orderQuantity,
                orderCustomerTotal: orders.orderCustomerTotal,
                orderStatus: orders.orderStatus,
                orderImage: orders.orderImage,
            })
            .from(orders)
            .where(and(
                eq(orders.shipmentId, id),
                isNull(orders.deletedAt)
            ))
            .orderBy(desc(orders.createdAt));

        return c.json({
            success: true,
            data: {
                ...shipment,
                orders: shipmentOrders,
            }
        });
    } catch (error) {
        console.error('Error fetching shipment:', error);
        return c.json({ success: false, error: 'Failed to fetch shipment' }, 500);
    }
});

// POST /api/shipments - Create new shipment
app.post('/', zValidator('json', createShipmentSchema), async (c) => {
    const db = createDb(c.env.DB);
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    try {
        // Verify all orders belong to this customer and org, and are in 'bought' or 'packed' status
        const orderRecords = await db
            .select({ id: orders.id, customerId: orders.customerId, orderStatus: orders.orderStatus })
            .from(orders)
            .where(and(
                eq(orders.organizationId, organizationId),
                inArray(orders.id, data.orderIds),
                isNull(orders.deletedAt)
            ));

        if (orderRecords.length !== data.orderIds.length) {
            return c.json({ success: false, error: 'Some orders were not found' }, 400);
        }

        // Verify all orders belong to the same customer
        const wrongCustomer = orderRecords.find(o => o.customerId !== data.customerId);
        if (wrongCustomer) {
            return c.json({ success: false, error: 'All orders must belong to the same customer' }, 400);
        }

        // Verify orders are in 'packed' status
        const invalidStatus = orderRecords.find(o => o.orderStatus !== 'packed');
        if (invalidStatus) {
            return c.json({ success: false, error: 'Orders must be in "packed" status to create a shipment' }, 400);
        }

        // Generate tracking number
        const trackingNumber = await generateTrackingNumber(db, organizationId);

        // Create shipment
        const [newShipment] = await db
            .insert(shipments)
            .values({
                organizationId,
                customerId: data.customerId,
                shipmentNumber: generateShipmentNumber(),
                trackingNumber,
                carrier: data.carrier,
                carrierReference: data.carrierReference,
                shippingFee: data.shippingFee,
                notes: data.notes,
                shipmentPhoto: data.shipmentPhoto,
            })
            .returning();

        // Assign orders to shipment and update their status to 'shipped'
        await db
            .update(orders)
            .set({
                shipmentId: newShipment.id,
                orderStatus: 'shipped',
                updatedAt: new Date().toISOString(),
            })
            .where(inArray(orders.id, data.orderIds));

        // Log activity
        await logActivity({
            db,
            organizationId,
            type: 'shipment',
            action: 'created',
            entityId: newShipment.id,
            title: `Shipment ${newShipment.trackingNumber}`,
            description: `Created shipment with ${data.orderIds.length} order(s)`,
            status: newShipment.shipmentStatus,
        });

        return c.json({ success: true, data: newShipment }, 201);
    } catch (error) {
        console.error('Error creating shipment:', error);
        return c.json({ success: false, error: 'Failed to create shipment' }, 500);
    }
});

// PUT /api/shipments/:id - Update shipment
app.put('/:id', zValidator('json', updateShipmentSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid shipment ID' }, 400);
    }

    try {
        const [updatedShipment] = await db
            .update(shipments)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(and(
                eq(shipments.id, id),
                eq(shipments.organizationId, organizationId),
                isNull(shipments.deletedAt)
            ))
            .returning();

        if (!updatedShipment) {
            return c.json({ success: false, error: 'Shipment not found' }, 404);
        }

        return c.json({ success: true, data: updatedShipment });
    } catch (error) {
        console.error('Error updating shipment:', error);
        return c.json({ success: false, error: 'Failed to update shipment' }, 500);
    }
});

// PATCH /api/shipments/:id/status - Update shipment status
app.patch('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const { status } = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid shipment ID' }, 400);
    }

    try {
        const [updatedShipment] = await db
            .update(shipments)
            .set({
                shipmentStatus: status,
                updatedAt: new Date().toISOString(),
            })
            .where(and(
                eq(shipments.id, id),
                eq(shipments.organizationId, organizationId),
                isNull(shipments.deletedAt)
            ))
            .returning();

        if (!updatedShipment) {
            return c.json({ success: false, error: 'Shipment not found' }, 404);
        }

        // If status is 'delivered', update all orders in shipment to 'delivered'
        if (status === 'delivered') {
            await db
                .update(orders)
                .set({
                    orderStatus: 'delivered',
                    updatedAt: new Date().toISOString(),
                })
                .where(and(
                    eq(orders.shipmentId, id),
                    isNull(orders.deletedAt)
                ));
        }

        // Log activity
        await logActivity({
            db,
            organizationId,
            type: 'shipment',
            action: 'status_changed',
            entityId: updatedShipment.id,
            title: `Shipment ${updatedShipment.trackingNumber}`,
            description: `Status changed to ${status}`,
            status: status,
        });

        return c.json({ success: true, data: updatedShipment });
    } catch (error) {
        console.error('Error updating shipment status:', error);
        return c.json({ success: false, error: 'Failed to update shipment status' }, 500);
    }
});

// POST /api/shipments/:id/orders - Add orders to shipment
app.post('/:id/orders', zValidator('json', addOrdersSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const { orderIds } = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid shipment ID' }, 400);
    }

    try {
        // Verify shipment exists
        const [shipment] = await db
            .select({ id: shipments.id, customerId: shipments.customerId })
            .from(shipments)
            .where(and(
                eq(shipments.id, id),
                eq(shipments.organizationId, organizationId),
                isNull(shipments.deletedAt)
            ));

        if (!shipment) {
            return c.json({ success: false, error: 'Shipment not found' }, 404);
        }

        // Verify orders belong to same customer
        const orderRecords = await db
            .select({ id: orders.id, customerId: orders.customerId })
            .from(orders)
            .where(and(
                eq(orders.organizationId, organizationId),
                inArray(orders.id, orderIds),
                isNull(orders.deletedAt)
            ));

        const wrongCustomer = orderRecords.find(o => o.customerId !== shipment.customerId);
        if (wrongCustomer) {
            return c.json({ success: false, error: 'All orders must belong to the same customer' }, 400);
        }

        // Assign orders to shipment and update status to 'shipped'
        await db
            .update(orders)
            .set({
                shipmentId: id,
                orderStatus: 'shipped',
                updatedAt: new Date().toISOString(),
            })
            .where(inArray(orders.id, orderIds));

        return c.json({ success: true, message: `Added ${orderIds.length} order(s) to shipment` });
    } catch (error) {
        console.error('Error adding orders to shipment:', error);
        return c.json({ success: false, error: 'Failed to add orders to shipment' }, 500);
    }
});

// DELETE /api/shipments/:id/orders/:orderId - Remove order from shipment
app.delete('/:id/orders/:orderId', async (c) => {
    const db = createDb(c.env.DB);
    const shipmentId = parseInt(c.req.param('id'));
    const orderId = parseInt(c.req.param('orderId'));
    const organizationId = c.get('organizationId');

    if (isNaN(shipmentId) || isNaN(orderId)) {
        return c.json({ success: false, error: 'Invalid IDs' }, 400);
    }

    try {
        // Remove order from shipment (set shipmentId to null)
        const [updatedOrder] = await db
            .update(orders)
            .set({
                shipmentId: null,
                updatedAt: new Date().toISOString(),
            })
            .where(and(
                eq(orders.id, orderId),
                eq(orders.shipmentId, shipmentId),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .returning();

        if (!updatedOrder) {
            return c.json({ success: false, error: 'Order not found in this shipment' }, 404);
        }

        return c.json({ success: true, message: 'Order removed from shipment' });
    } catch (error) {
        console.error('Error removing order from shipment:', error);
        return c.json({ success: false, error: 'Failed to remove order from shipment' }, 500);
    }
});

// DELETE /api/shipments/:id - Soft delete shipment
app.delete('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid shipment ID' }, 400);
    }

    try {
        // Remove orders from shipment and revert status to 'packed'
        await db
            .update(orders)
            .set({
                shipmentId: null,
                orderStatus: 'packed',
                updatedAt: new Date().toISOString(),
            })
            .where(and(
                eq(orders.shipmentId, id),
                eq(orders.organizationId, organizationId)
            ));

        // Soft delete shipment
        const [deletedShipment] = await db
            .update(shipments)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(shipments.id, id),
                eq(shipments.organizationId, organizationId),
                isNull(shipments.deletedAt)
            ))
            .returning();

        if (!deletedShipment) {
            return c.json({ success: false, error: 'Shipment not found' }, 404);
        }

        // Log activity
        await logActivity({
            db,
            organizationId,
            type: 'shipment',
            action: 'deleted',
            entityId: deletedShipment.id,
            title: `Shipment ${deletedShipment.trackingNumber}`,
            description: 'Shipment deleted',
            status: deletedShipment.shipmentStatus,
        });

        return c.json({ success: true, message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        return c.json({ success: false, error: 'Failed to delete shipment' }, 500);
    }
});

export default app;
