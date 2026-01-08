/**
 * Invoices API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull, count, or, sql } from 'drizzle-orm';
import { createDb, invoices, customers } from '../db';

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
    customerId: z.number().int().positive(),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

const updateStatusSchema = z.object({
    status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']),
});

// GET /api/invoices - List invoices with pagination and search
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
        eq(invoices.organizationId, organizationId),
        isNull(invoices.deletedAt)
    );

    try {
        // Get total count (with search filter if applicable)
        let total: number;
        if (searchPattern) {
            const [countResult] = await db
                .select({ total: count() })
                .from(invoices)
                .leftJoin(customers, eq(invoices.customerId, customers.id))
                .where(and(
                    baseConditions,
                    or(
                        sql`LOWER(${invoices.invoiceNumber}) LIKE LOWER(${searchPattern})`,
                        sql`LOWER(${customers.customerName}) LIKE LOWER(${searchPattern})`
                    )
                ));
            total = countResult?.total || 0;
        } else {
            const [countResult] = await db
                .select({ total: count() })
                .from(invoices)
                .where(baseConditions);
            total = countResult?.total || 0;
        }

        // Build where conditions
        const whereConditions = searchPattern
            ? and(
                baseConditions,
                or(
                    sql`LOWER(${invoices.invoiceNumber}) LIKE LOWER(${searchPattern})`,
                    sql`LOWER(${customers.customerName}) LIKE LOWER(${searchPattern})`
                )
            )
            : baseConditions;

        const allInvoices = await db
            .select({
                id: invoices.id,
                invoiceNumber: invoices.invoiceNumber,
                invoiceTotal: invoices.invoiceTotal,
                invoicePaid: invoices.invoicePaid,
                invoiceNotes: invoices.invoiceNotes,
                dueDate: invoices.dueDate,
                invoiceStatus: invoices.invoiceStatus,
                customerId: invoices.customerId,
                organizationId: invoices.organizationId,
                createdAt: invoices.createdAt,
                updatedAt: invoices.updatedAt,
                deletedAt: invoices.deletedAt,
                customerName: customers.customerName,
            })
            .from(invoices)
            .leftJoin(customers, eq(invoices.customerId, customers.id))
            .where(whereConditions)
            .orderBy(desc(invoices.createdAt))
            .limit(limit)
            .offset(offset);

        return c.json({
            success: true,
            data: allInvoices,
            meta: { page, pageSize: limit, total }
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return c.json({ success: false, error: 'Failed to fetch invoices' }, 500);
    }
});

// GET /api/invoices/counts - Get counts per status
app.get('/counts', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    const statusList = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'] as const;

    try {
        // Get total count
        const [totalResult] = await db
            .select({ total: count() })
            .from(invoices)
            .where(and(
                eq(invoices.organizationId, organizationId),
                isNull(invoices.deletedAt)
            ));

        const counts: Record<string, number> = {
            all: totalResult?.total || 0,
        };

        // Get count for each status
        for (const status of statusList) {
            const [result] = await db
                .select({ total: count() })
                .from(invoices)
                .where(and(
                    eq(invoices.organizationId, organizationId),
                    eq(invoices.invoiceStatus, status),
                    isNull(invoices.deletedAt)
                ));
            counts[status] = result?.total || 0;
        }

        return c.json({ success: true, data: counts });
    } catch (error) {
        console.error('Error fetching invoice counts:', error);
        return c.json({ success: false, error: 'Failed to fetch invoice counts' }, 500);
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
