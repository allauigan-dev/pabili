/**
 * Dashboard Stats API Routes
 * Provides accurate counts for dashboard cards
 */

import { Hono } from 'hono';
import { eq, and, isNull, count, sql, inArray } from 'drizzle-orm';
import { createDb, orders, stores, customers, invoices, payments } from '../db';

import type { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// GET /api/stats - Get dashboard statistics
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    try {
        // Get total orders count
        const [ordersCount] = await db
            .select({ total: count() })
            .from(orders)
            .where(and(
                eq(orders.organizationId, organizationId),
                isNull(orders.deletedAt)
            ));

        // Get pending orders count
        const [pendingCount] = await db
            .select({ total: count() })
            .from(orders)
            .where(and(
                eq(orders.organizationId, organizationId),
                eq(orders.orderStatus, 'pending'),
                isNull(orders.deletedAt)
            ));

        // Get active stores count
        const [activeStoresCount] = await db
            .select({ total: count() })
            .from(stores)
            .where(and(
                eq(stores.organizationId, organizationId),
                eq(stores.storeStatus, 'active'),
                isNull(stores.deletedAt)
            ));

        // Get total customers count
        const [customersCount] = await db
            .select({ total: count() })
            .from(customers)
            .where(and(
                eq(customers.organizationId, organizationId),
                isNull(customers.deletedAt)
            ));

        // Get total invoices count
        const [invoicesCount] = await db
            .select({ total: count() })
            .from(invoices)
            .where(and(
                eq(invoices.organizationId, organizationId),
                isNull(invoices.deletedAt)
            ));

        // Get overdue invoices count
        const [overdueInvoicesCount] = await db
            .select({ total: count() })
            .from(invoices)
            .where(and(
                eq(invoices.organizationId, organizationId),
                eq(invoices.invoiceStatus, 'overdue'),
                isNull(invoices.deletedAt)
            ));

        // Get total payments count
        const [paymentsCount] = await db
            .select({ total: count() })
            .from(payments)
            .where(and(
                eq(payments.organizationId, organizationId),
                isNull(payments.deletedAt)
            ));

        // Get revenue (sum of order totals for bought/delivered orders)
        const [revenueResult] = await db
            .select({ total: sql<number>`COALESCE(SUM(${orders.orderTotal}), 0)` })
            .from(orders)
            .where(and(
                eq(orders.organizationId, organizationId),
                inArray(orders.orderStatus, ['bought', 'packed', 'delivered']),
                isNull(orders.deletedAt)
            ));

        return c.json({
            success: true,
            data: {
                orders: ordersCount?.total || 0,
                pending: pendingCount?.total || 0,
                activeStores: activeStoresCount?.total || 0,
                customers: customersCount?.total || 0,
                invoices: invoicesCount?.total || 0,
                overdueInvoices: overdueInvoicesCount?.total || 0,
                payments: paymentsCount?.total || 0,
                revenue: revenueResult?.total || 0,
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return c.json({ success: false, error: 'Failed to fetch dashboard stats' }, 500);
    }
});

export default app;

