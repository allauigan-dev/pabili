/**
 * Activities API Routes
 */

import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { createDb, activities } from '../db';
import type { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

const app = new Hono<AppEnv>();

// Apply middlewares to all routes
app.use('*', requireAuth);
app.use('*', requireOrganization);

// GET /api/activities - List recent activities
app.get('/', async (c) => {
    const db = createDb(c.env.DB);
    const organizationId = c.get('organizationId');

    // Limit to 50 most recent activities
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50')));

    try {
        const recentActivities = await db
            .select()
            .from(activities)
            .where(eq(activities.organizationId, organizationId))
            .orderBy(desc(activities.createdAt))
            .limit(limit);

        return c.json({
            success: true,
            data: recentActivities
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        return c.json({ success: false, error: 'Failed to fetch activities' }, 500);
    }
});

export default app;
