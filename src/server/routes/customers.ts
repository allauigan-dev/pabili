/**
 * Customers API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull, sum, count } from 'drizzle-orm';
import { createDb, customers, orders, payments } from '../db';

import type { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// Validation schemas
const createCustomerSchema = z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    customerAddress: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email().optional().or(z.literal('')),
    customerPhoto: z.string().optional(),
    customerDescription: z.string().optional(),
    customerStatus: z.enum(['active', 'inactive']).default('active'),
});

const updateCustomerSchema = createCustomerSchema.partial();

// GET /api/customers - List customers with pagination and balance
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
            .from(customers)
            .where(and(
                eq(customers.organizationId, organizationId),
                isNull(customers.deletedAt)
            ));
        const total = countResult?.total || 0;

        // Get paginated customers
        const allCustomers = await db
            .select()
            .from(customers)
            .where(and(
                eq(customers.organizationId, organizationId),
                isNull(customers.deletedAt)
            ))
            .orderBy(desc(customers.createdAt))
            .limit(limit)
            .offset(offset);

        // Calculate balance for each customer in parallel
        const customersWithBalance = await Promise.all(
            allCustomers.map(async (customer) => {
                // Get total orders amount for this customer
                const [ordersResult] = await db
                    .select({ total: sum(orders.orderCustomerTotal) })
                    .from(orders)
                    .where(and(
                        eq(orders.customerId, customer.id),
                        eq(orders.organizationId, organizationId),
                        isNull(orders.deletedAt)
                    ));

                // Get total confirmed payments for this customer
                const [paymentsResult] = await db
                    .select({ total: sum(payments.paymentAmount) })
                    .from(payments)
                    .where(and(
                        eq(payments.customerId, customer.id),
                        eq(payments.organizationId, organizationId),
                        eq(payments.paymentStatus, 'confirmed'),
                        isNull(payments.deletedAt)
                    ));

                const totalOrders = Number(ordersResult?.total ?? 0);
                const totalPayments = Number(paymentsResult?.total ?? 0);

                return {
                    ...customer,
                    totalOrders,
                    totalPayments,
                    balance: totalOrders - totalPayments,
                };
            })
        );

        return c.json({
            success: true,
            data: customersWithBalance,
            meta: { page, pageSize: limit, total }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return c.json({ success: false, error: 'Failed to fetch customers' }, 500);
    }
});

// GET /api/customers/:id - Get single customer
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid customer ID' }, 400);
    }

    try {
        const [customer] = await db
            .select()
            .from(customers)
            .where(and(
                eq(customers.id, id),
                eq(customers.organizationId, organizationId),
                isNull(customers.deletedAt)
            ));

        if (!customer) {
            return c.json({ success: false, error: 'Customer not found' }, 404);
        }

        return c.json({ success: true, data: customer });
    } catch (error) {
        console.error('Error fetching customer:', error);
        return c.json({ success: false, error: 'Failed to fetch customer' }, 500);
    }
});

// GET /api/customers/:id/orders - Get customer's orders
app.get('/:id/orders', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid customer ID' }, 400);
    }

    try {
        const customerOrders = await db
            .select()
            .from(orders)
            .where(and(
                eq(orders.customerId, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ))
            .orderBy(desc(orders.createdAt));

        return c.json({ success: true, data: customerOrders });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return c.json({ success: false, error: 'Failed to fetch customer orders' }, 500);
    }
});

// GET /api/customers/:id/balance - Get customer's outstanding balance
app.get('/:id/balance', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid customer ID' }, 400);
    }

    try {
        // Get total orders amount
        const [ordersResult] = await db
            .select({ total: sum(orders.orderCustomerTotal) })
            .from(orders)
            .where(and(
                eq(orders.customerId, id),
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ));

        // Get total payments amount
        const [paymentsResult] = await db
            .select({ total: sum(payments.paymentAmount) })
            .from(payments)
            .where(and(
                eq(payments.customerId, id),
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

// POST /api/customers - Create new customer
app.post('/', zValidator('json', createCustomerSchema), async (c) => {
    const db = createDb(c.env.DB);
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    try {
        const [newCustomer] = await db
            .insert(customers)
            .values({
                ...data,
                organizationId
            })
            .returning();

        return c.json({ success: true, data: newCustomer }, 201);
    } catch (error) {
        console.error('Error creating customer:', error);
        return c.json({ success: false, error: 'Failed to create customer' }, 500);
    }
});

// PUT /api/customers/:id - Update customer
app.put('/:id', zValidator('json', updateCustomerSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid customer ID' }, 400);
    }

    try {
        const [updatedCustomer] = await db
            .update(customers)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(and(
                eq(customers.id, id),
                eq(customers.organizationId, organizationId),
                isNull(customers.deletedAt)
            ))
            .returning();

        if (!updatedCustomer) {
            return c.json({ success: false, error: 'Customer not found' }, 404);
        }

        return c.json({ success: true, data: updatedCustomer });
    } catch (error) {
        console.error('Error updating customer:', error);
        return c.json({ success: false, error: 'Failed to update customer' }, 500);
    }
});

// DELETE /api/customers/:id - Soft delete customer
app.delete('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid customer ID' }, 400);
    }

    try {
        const [deletedCustomer] = await db
            .update(customers)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(customers.id, id),
                eq(customers.organizationId, organizationId),
                isNull(customers.deletedAt)
            ))
            .returning();

        if (!deletedCustomer) {
            return c.json({ success: false, error: 'Customer not found' }, 404);
        }

        return c.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return c.json({ success: false, error: 'Failed to delete customer' }, 500);
    }
});

export default app;
