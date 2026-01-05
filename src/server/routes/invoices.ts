/**
 * Invoices API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { createDb, invoices } from '../db';

import type { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// Generate invoice number
function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${year}${month}-${random}`;
}

// Validation schemas
// ... (rest same)
const createInvoiceSchema = z.object({
    invoiceTotal: z.number().nonnegative().default(0),
    invoicePaid: z.number().nonnegative().default(0),
    invoiceNotes: z.string().optional(),
    dueDate: z.string().optional(),
    invoiceStatus: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']).default('draft'),
    resellerId: z.number().int().positive(),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

const updateStatusSchema = z.object({
    status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']),
});

// GET /api/invoices - List all invoices
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    try {
        const allInvoices = await db
            .select()
            .from(invoices)
            .where(and(
                eq(invoices.organizationId, organizationId),
                isNull(invoices.deletedAt)
            ))
            .orderBy(desc(invoices.createdAt));

        return c.json({ success: true, data: allInvoices });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return c.json({ success: false, error: 'Failed to fetch invoices' }, 500);
    }
});

// GET /api/invoices/:id - Get single invoice
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid invoice ID' }, 400);
    }

    try {
        const [invoice] = await db
            .select()
            .from(invoices)
            .where(and(
                eq(invoices.id, id),
                eq(invoices.organizationId, organizationId),
                isNull(invoices.deletedAt)
            ));

        if (!invoice) {
            return c.json({ success: false, error: 'Invoice not found' }, 404);
        }

        return c.json({ success: true, data: invoice });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return c.json({ success: false, error: 'Failed to fetch invoice' }, 500);
    }
});

// GET /api/invoices/:id/pdf - Generate invoice PDF (placeholder)
app.get('/:id/pdf', async (c) => {
    // TODO: Implement PDF generation
    return c.json({
        success: false,
        error: 'PDF generation not yet implemented'
    }, 501);
});

// POST /api/invoices - Create new invoice
app.post('/', zValidator('json', createInvoiceSchema), async (c) => {
    const db = createDb(c.env.DB);
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    try {
        const [newInvoice] = await db
            .insert(invoices)
            .values({
                ...data,
                organizationId,
                invoiceNumber: generateInvoiceNumber(),
            })
            .returning();

        return c.json({ success: true, data: newInvoice }, 201);
    } catch (error) {
        console.error('Error creating invoice:', error);
        return c.json({ success: false, error: 'Failed to create invoice' }, 500);
    }
});

// PUT /api/invoices/:id - Update invoice
app.put('/:id', zValidator('json', updateInvoiceSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid invoice ID' }, 400);
    }

    try {
        const [updatedInvoice] = await db
            .update(invoices)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(and(
                eq(invoices.id, id),
                eq(invoices.organizationId, organizationId),
                isNull(invoices.deletedAt)
            ))
            .returning();

        if (!updatedInvoice) {
            return c.json({ success: false, error: 'Invoice not found' }, 404);
        }

        return c.json({ success: true, data: updatedInvoice });
    } catch (error) {
        console.error('Error updating invoice:', error);
        return c.json({ success: false, error: 'Failed to update invoice' }, 500);
    }
});

// PATCH /api/invoices/:id/status - Update invoice status
app.patch('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const { status } = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid invoice ID' }, 400);
    }

    try {
        const [updatedInvoice] = await db
            .update(invoices)
            .set({ invoiceStatus: status, updatedAt: new Date().toISOString() })
            .where(and(
                eq(invoices.id, id),
                eq(invoices.organizationId, organizationId),
                isNull(invoices.deletedAt)
            ))
            .returning();

        if (!updatedInvoice) {
            return c.json({ success: false, error: 'Invoice not found' }, 404);
        }

        return c.json({ success: true, data: updatedInvoice });
    } catch (error) {
        console.error('Error updating invoice status:', error);
        return c.json({ success: false, error: 'Failed to update invoice status' }, 500);
    }
});

// DELETE /api/invoices/:id - Soft delete invoice
app.delete('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid invoice ID' }, 400);
    }

    try {
        const [deletedInvoice] = await db
            .update(invoices)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(invoices.id, id),
                eq(invoices.organizationId, organizationId),
                isNull(invoices.deletedAt)
            ))
            .returning();

        if (!deletedInvoice) {
            return c.json({ success: false, error: 'Invoice not found' }, 404);
        }

        return c.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return c.json({ success: false, error: 'Failed to delete invoice' }, 500);
    }
});

export default app;
