/**
 * Resellers API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull, sum } from 'drizzle-orm';
import { createDb, resellers, orders, payments } from '../db';

import { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// Validation schemas
// ... (rest same)
const createResellerSchema = z.object({
    resellerName: z.string().min(1, 'Reseller name is required'),
    resellerAddress: z.string().optional(),
    resellerPhone: z.string().optional(),
    resellerEmail: z.string().email().optional().or(z.literal('')),
    resellerPhoto: z.string().optional(),
    resellerDescription: z.string().optional(),
    resellerStatus: z.enum(['active', 'inactive']).default('active'),
});

const updateResellerSchema = createResellerSchema.partial();

// GET /api/resellers - List all resellers
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    try {
        const allResellers = await db
            .select()
            .from(resellers)
            .where(and(
                eq(resellers.organizationId, organizationId),
                isNull(resellers.deletedAt)
            ))
            .orderBy(desc(resellers.createdAt));

        return c.json({ success: true, data: allResellers });
    } catch (error) {
        console.error('Error fetching resellers:', error);
        return c.json({ success: false, error: 'Failed to fetch resellers' }, 500);
    }
});

// GET /api/resellers/:id - Get single reseller
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid reseller ID' }, 400);
    }

    try {
        const [reseller] = await db
            .select()
            .from(resellers)
            .where(and(
                eq(resellers.id, id),
                eq(resellers.organizationId, organizationId),
                isNull(resellers.deletedAt)
            ));

        if (!reseller) {
            return c.json({ success: false, error: 'Reseller not found' }, 404);
        }

        return c.json({ success: true, data: reseller });
    } catch (error) {
        console.error('Error fetching reseller:', error);
        return c.json({ success: false, error: 'Failed to fetch reseller' }, 500);
    }
});

// GET /api/resellers/:id/orders - Get reseller's orders
app.get('/:id/orders', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid reseller ID' }, 400);
    }

    try {
        const resellerOrders = await db
            .select()
            .from(orders)
            .where(and(
                eq(orders.resellerId, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .orderBy(desc(orders.createdAt));

        return c.json({ success: true, data: resellerOrders });
    } catch (error) {
        console.error('Error fetching reseller orders:', error);
        return c.json({ success: false, error: 'Failed to fetch reseller orders' }, 500);
    }
});

// GET /api/resellers/:id/balance - Get reseller's outstanding balance
app.get('/:id/balance', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid reseller ID' }, 400);
    }

    try {
        // Get total orders amount
        const [ordersResult] = await db
            .select({ total: sum(orders.orderResellerTotal) })
            .from(orders)
            .where(and(
                eq(orders.resellerId, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ));

        // Get total payments amount
        const [paymentsResult] = await db
            .select({ total: sum(payments.paymentAmount) })
            .from(payments)
            .where(and(
                eq(payments.resellerId, id),
                eq(payments.organizationId, organizationId),
                eq(payments.paymentStatus, 'confirmed'),
                isNull(payments.deletedAt)
            ));

        const totalOrders = Number(ordersResult?.total ?? 0);
        const totalPayments = Number(paymentsResult?.total ?? 0);
        const balance = totalOrders - totalPayments;

        return c.json({
            success: true,
            data: {
                totalOrders,
                totalPayments,
                balance,
            },
        });
    } catch (error) {
        console.error('Error calculating balance:', error);
        return c.json({ success: false, error: 'Failed to calculate balance' }, 500);
    }
});

// POST /api/resellers - Create new reseller
app.post('/', zValidator('json', createResellerSchema), async (c) => {
    const db = createDb(c.env.DB);
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    try {
        const [newReseller] = await db
            .insert(resellers)
            .values({
                ...data,
                organizationId
            })
            .returning();

        return c.json({ success: true, data: newReseller }, 201);
    } catch (error) {
        console.error('Error creating reseller:', error);
        return c.json({ success: false, error: 'Failed to create reseller' }, 500);
    }
});

// PUT /api/resellers/:id - Update reseller
app.put('/:id', zValidator('json', updateResellerSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid reseller ID' }, 400);
    }

    try {
        const [updatedReseller] = await db
            .update(resellers)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(and(
                eq(resellers.id, id),
                eq(resellers.organizationId, organizationId),
                isNull(resellers.deletedAt)
            ))
            .returning();

        if (!updatedReseller) {
            return c.json({ success: false, error: 'Reseller not found' }, 404);
        }

        return c.json({ success: true, data: updatedReseller });
    } catch (error) {
        console.error('Error updating reseller:', error);
        return c.json({ success: false, error: 'Failed to update reseller' }, 500);
    }
});

// DELETE /api/resellers/:id - Soft delete reseller
app.delete('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid reseller ID' }, 400);
    }

    try {
        const [deletedReseller] = await db
            .update(resellers)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(resellers.id, id),
                eq(resellers.organizationId, organizationId),
                isNull(resellers.deletedAt)
            ))
            .returning();

        if (!deletedReseller) {
            return c.json({ success: false, error: 'Reseller not found' }, 404);
        }

        return c.json({ success: true, message: 'Reseller deleted successfully' });
    } catch (error) {
        console.error('Error deleting reseller:', error);
        return c.json({ success: false, error: 'Failed to delete reseller' }, 500);
    }
});

export default app;
