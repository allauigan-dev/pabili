import { Hono } from 'hono';
import { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

const app = new Hono<AppEnv>();

// Apply middlewares
app.use('*', requireAuth);
app.use('*', requireOrganization);

// GET /files/:key - Serve file from R2
app.get('/:key{.+}', async (c) => {
    const key = c.req.param('key');
    const organizationId = c.get('organizationId');

    if (!key) {
        return c.json({ success: false, error: 'No key provided' }, 400);
    }

    // Ensure the key belongs to the organization
    if (!key.startsWith(`orgs/${organizationId}/`)) {
        return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    try {
        // Check if R2 bucket is available
        if (!c.env.BUCKET) {
            console.error('R2 bucket not configured');
            return c.json({ success: false, error: 'File storage not configured' }, 503);
        }

        const object = await c.env.BUCKET.get(key);

        if (!object) {
            return c.json({ success: false, error: 'File not found' }, 404);
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers as any);
        headers.set('etag', object.httpEtag);
        headers.set('cache-control', 'public, max-age=31536000'); // 1 year cache

        return new Response(object.body as any, {
            headers: headers as any,
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return c.json({ success: false, error: 'Failed to serve file' }, 500);
    }
});

export default app;
