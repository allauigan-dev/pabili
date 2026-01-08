/**
 * Stores API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull, count, or, sql } from 'drizzle-orm';
import { createDb, stores } from '../db';

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
const createStoreSchema = z.object({
    storeName: z.string().min(1, 'Store name is required'),
    storeAddress: z.string().optional(),
    storePhone: z.string().optional(),
    storeEmail: z.string().email().optional().or(z.literal('')),
    storeLogo: z.string().optional(),
    storeCover: z.string().optional(),
    storeDescription: z.string().optional(),
    storeStatus: z.enum(['active', 'inactive']).default('active'),
});

const updateStoreSchema = createStoreSchema.partial();

// GET /api/stores - List stores with pagination and search
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

    // Build where conditions
    const baseConditions = and(
        eq(stores.organizationId, organizationId),
        isNull(stores.deletedAt)
    );

    const whereConditions = searchPattern
        ? and(
            baseConditions,
            or(
                sql`LOWER(${stores.storeName}) LIKE LOWER(${searchPattern})`,
                sql`LOWER(${stores.storeAddress}) LIKE LOWER(${searchPattern})`
            )
        )
        : baseConditions;

    try {
        // Get total count (with search filter)
        const [countResult] = await db
            .select({ total: count() })
            .from(stores)
            .where(whereConditions);
        const total = countResult?.total || 0;

        const allStores = await db
            .select()
            .from(stores)
            .where(whereConditions)
            .orderBy(desc(stores.createdAt))
            .limit(limit)
            .offset(offset);

        return c.json({
            success: true,
            data: allStores,
            meta: { page, pageSize: limit, total }
        });
    } catch (error) {
        console.error('Error fetching stores:', error);
        return c.json({ success: false, error: 'Failed to fetch stores' }, 500);
    }
});

// GET /api/stores/counts - Get counts per status
app.get('/counts', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    const statusList = ['active', 'inactive'] as const;

    try {
        // Get total count
        const [totalResult] = await db
            .select({ total: count() })
            .from(stores)
            .where(and(
                eq(stores.organizationId, organizationId),
                isNull(stores.deletedAt)
            ));

        const counts: Record<string, number> = {
            all: totalResult?.total || 0,
        };

        // Get count for each status
        for (const status of statusList) {
            const [result] = await db
                .select({ total: count() })
                .from(stores)
                .where(and(
                    eq(stores.organizationId, organizationId),
                    eq(stores.storeStatus, status),
                    isNull(stores.deletedAt)
                ));
            counts[status] = result?.total || 0;
        }

        return c.json({ success: true, data: counts });
    } catch (error) {
        console.error('Error fetching store counts:', error);
        return c.json({ success: false, error: 'Failed to fetch store counts' }, 500);
    }
});

// GET /api/stores/:id - Get single store
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid store ID' }, 400);
    }

    try {
        const [store] = await db
            .select()
            .from(stores)
            .where(and(
                eq(stores.id, id),
                eq(stores.organizationId, organizationId),
                isNull(stores.deletedAt)
            ));

        if (!store) {
            return c.json({ success: false, error: 'Store not found' }, 404);
        }

        return c.json({ success: true, data: store });
    } catch (error) {
        console.error('Error fetching store:', error);
        return c.json({ success: false, error: 'Failed to fetch store' }, 500);
    }
});

// POST /api/stores - Create new store
app.post('/', zValidator('json', createStoreSchema), async (c) => {
    const db = createDb(c.env.DB);
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    try {
        const [newStore] = await db
            .insert(stores)
            .values({
                ...data,
                organizationId
            })
            .returning();

        // Log activity
        await logActivity({
            db,
            organizationId,
            type: 'store',
            action: 'created',
            entityId: newStore.id,
            title: newStore.storeName,
            description: `New store added`,
            status: newStore.storeStatus,
        });

        return c.json({ success: true, data: newStore }, 201);
    } catch (error) {
        console.error('Error creating store:', error);
        return c.json({ success: false, error: 'Failed to create store' }, 500);
    }
});

// PUT /api/stores/:id - Update store
app.put('/:id', zValidator('json', updateStoreSchema), async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const data = c.req.valid('json');
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid store ID' }, 400);
    }

    try {
        const [updatedStore] = await db
            .update(stores)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(and(
                eq(stores.id, id),
                eq(stores.organizationId, organizationId),
                isNull(stores.deletedAt)
            ))
            .returning();

        if (updatedStore) {
            // Log activity
            await logActivity({
                db,
                organizationId,
                type: 'store',
                action: 'updated',
                entityId: updatedStore.id,
                title: updatedStore.storeName,
                description: `Store details modified`,
                status: updatedStore.storeStatus,
            });
        }

        if (!updatedStore) {
            return c.json({ success: false, error: 'Store not found' }, 404);
        }

        return c.json({ success: true, data: updatedStore });
    } catch (error) {
        console.error('Error updating store:', error);
        return c.json({ success: false, error: 'Failed to update store' }, 500);
    }
});

// DELETE /api/stores/:id - Soft delete store
app.delete('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const organizationId = c.get('organizationId');

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid store ID' }, 400);
    }

    try {
        const [deletedStore] = await db
            .update(stores)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(stores.id, id),
                eq(stores.organizationId, organizationId),
                isNull(stores.deletedAt)
            ))
            .returning();

        if (deletedStore) {
            // Log activity
            await logActivity({
                db,
                organizationId,
                type: 'store',
                action: 'deleted',
                entityId: deletedStore.id,
                title: deletedStore.storeName,
                description: `Store deleted`,
                status: deletedStore.storeStatus,
            });
        }

        if (!deletedStore) {
            return c.json({ success: false, error: 'Store not found' }, 404);
        }

        return c.json({ success: true, message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        return c.json({ success: false, error: 'Failed to delete store' }, 500);
    }
});

export default app;
