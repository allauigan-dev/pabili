/**
 * Dashboard Stats API Routes
 * Provides accurate counts for dashboard cards
 */

import { Hono } from 'hono';
import { eq, and, isNull, count } from 'drizzle-orm';
import { createDb, orders, stores, customers } from '../db';

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

        return c.json({
            success: true,
            data: {
                orders: ordersCount?.total || 0,
                pending: pendingCount?.total || 0,
                activeStores: activeStoresCount?.total || 0,
                customers: customersCount?.total || 0,
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return c.json({ success: false, error: 'Failed to fetch dashboard stats' }, 500);
    }
});

export default app;
