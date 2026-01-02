/**
 * Stores API Routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { createDb, stores } from '../db';

const app = new Hono<{ Bindings: Env }>();

// Validation schemas
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

// GET /api/stores - List all stores
app.get('/', async (c) => {
    const db = createDb(c.env.DB);

    try {
        const allStores = await db
            .select()
            .from(stores)
            .where(isNull(stores.deletedAt))
            .orderBy(desc(stores.createdAt));

        return c.json({ success: true, data: allStores });
    } catch (error) {
        console.error('Error fetching stores:', error);
        return c.json({ success: false, error: 'Failed to fetch stores' }, 500);
    }
});

// GET /api/stores/:id - Get single store
app.get('/:id', async (c) => {
    const db = createDb(c.env.DB);
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid store ID' }, 400);
    }

    try {
        const [store] = await db
            .select()
            .from(stores)
            .where(and(eq(stores.id, id), isNull(stores.deletedAt)));

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

    try {
        const [newStore] = await db
            .insert(stores)
            .values(data)
            .returning();

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

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid store ID' }, 400);
    }

    try {
        const [updatedStore] = await db
            .update(stores)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(and(eq(stores.id, id), isNull(stores.deletedAt)))
            .returning();

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

    if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid store ID' }, 400);
    }

    try {
        const [deletedStore] = await db
            .update(stores)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(eq(stores.id, id), isNull(stores.deletedAt)))
            .returning();

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
