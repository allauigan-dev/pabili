/**
 * Payments API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { createDb, payments } from '../db';

import { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

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
    resellerId: z.number().int().positive(),
    invoiceId: z.number().int().positive().optional(),
});

const updatePaymentSchema = createPaymentSchema.partial();

// GET /api/payments - List all payments
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    try {
        const allPayments = await db
            .select()
            .from(payments)
            .where(and(
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ))
            .orderBy(desc(payments.createdAt));

        return c.json({ success: true, data: allPayments });
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
