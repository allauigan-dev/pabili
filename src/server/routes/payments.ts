/**
 * Payments API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull, count } from 'drizzle-orm';
import { createDb, payments } from '../db';

import type { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';
import { logActivity } from '../lib/activity-logger';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// Validation schemas
// ... (rest same)
const createPaymentSchema = z.object({
    paymentAmount: z.number().positive('Amount must be positive'),
    paymentMethod: z.enum(['cash', 'gcash', 'paymaya', 'bank_transfer', 'other']).default('cash'),
    paymentReference: z.string().optional(),
    paymentProof: z.string().optional(),
    paymentNotes: z.string().optional(),
    customerId: z.number().int().positive(),
    invoiceId: z.number().int().positive().optional(),
});

const updatePaymentSchema = createPaymentSchema.partial();

// GET /api/payments - List payments with pagination
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    // Pagination params
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;

    try {
        // Get total count
        const [countResult] = await db
            .select({ total: count() })
            .from(payments)
            .where(and(
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ));
        const total = countResult?.total || 0;

        const allPayments = await db
            .select()
            .from(payments)
            .where(and(
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ))
            .orderBy(desc(payments.createdAt))
            .limit(limit)
            .offset(offset);

        return c.json({
            success: true,
            data: allPayments,
            meta: { page, pageSize: limit, total }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return c.json({ success: false, error: 'Failed to fetch payments' }, 500);
    }
});

// GET /api/payments/:id - Get single payment
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid payment ID' }, 400);
    }

    try {
        const [payment] = await db
            .select()
            .from(payments)
            .where(and(
                eq(payments.id, id),
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ));

        if (!payment) {
            return c.json({ success: false, error: 'Payment not found' }, 404);
        }

        return c.json({ success: true, data: payment });
    } catch (error) {
        console.error('Error fetching payment:', error);
        return c.json({ success: false, error: 'Failed to fetch payment' }, 500);
    }
});

// POST /api/payments - Record new payment
app.post('/', zValidator('json', createPaymentSchema), async (c) => {
    const db = createDb(c.env.DB);
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    try {
        const [newPayment] = await db
            .insert(payments)
            .values({
                ...data,
                organizationId
            })
            .returning();

        // Log activity
        await logActivity({
            db,
            organizationId,
            type: 'payment',
            action: 'created',
            entityId: newPayment.id,
            title: `Payment from Customer`, // Should ideally fetch customer name but let's keep it simple for now
            description: `${newPayment.paymentMethod.replace('_', ' ')} payment recorded`,
            status: newPayment.paymentStatus,
        });

        return c.json({ success: true, data: newPayment }, 201);
    } catch (error) {
        console.error('Error creating payment:', error);
        return c.json({ success: false, error: 'Failed to create payment' }, 500);
    }
});

// PUT /api/payments/:id - Update payment
app.put('/:id', zValidator('json', updatePaymentSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid payment ID' }, 400);
    }

    try {
        const [updatedPayment] = await db
            .update(payments)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(and(
                eq(payments.id, id),
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ))
            .returning();

        if (!updatedPayment) {
            return c.json({ success: false, error: 'Payment not found' }, 404);
        }

        return c.json({ success: true, data: updatedPayment });
    } catch (error) {
        console.error('Error updating payment:', error);
        return c.json({ success: false, error: 'Failed to update payment' }, 500);
    }
});

// PATCH /api/payments/:id/confirm - Confirm payment
app.patch('/:id/confirm', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid payment ID' }, 400);
    }

    try {
        const [confirmedPayment] = await db
            .update(payments)
            .set({ paymentStatus: 'confirmed', updatedAt: new Date().toISOString() })
            .where(and(
                eq(payments.id, id),
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ))
            .returning();

        if (confirmedPayment) {
            // Log activity
            await logActivity({
                db,
                organizationId,
                type: 'payment',
                action: 'status_changed',
                entityId: confirmedPayment.id,
                title: `Payment Confirmed`,
                description: `Payment was confirmed and verified`,
                status: 'confirmed',
            });
        }

        if (!confirmedPayment) {
            return c.json({ success: false, error: 'Payment not found' }, 404);
        }

        return c.json({ success: true, data: confirmedPayment });
    } catch (error) {
        console.error('Error confirming payment:', error);
        return c.json({ success: false, error: 'Failed to confirm payment' }, 500);
    }
});

// DELETE /api/payments/:id - Soft delete payment
app.delete('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid payment ID' }, 400);
    }

    try {
        const [deletedPayment] = await db
            .update(payments)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(payments.id, id),
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ))
            .returning();

        if (deletedPayment) {
            // Log activity
            await logActivity({
                db,
                organizationId,
                type: 'payment',
                action: 'deleted',
                entityId: deletedPayment.id,
                title: `Payment #${deletedPayment.id}`,
                description: `Payment record deleted`,
                status: deletedPayment.paymentStatus,
            });
        }

        if (!deletedPayment) {
            return c.json({ success: false, error: 'Payment not found' }, 404);
        }

        return c.json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        return c.json({ success: false, error: 'Failed to delete payment' }, 500);
    }
});

export default app;
