/**
 * File Serving API Routes (R2)
 * Serves files uploaded to R2 storage
 */

import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>().basePath('/files');

// GET /files/:key - Serve file from R2
app.get('/:key{.+}', async (c) => {
    const key = c.req.param('key');

    if (!key) {
        return c.json({ success: false, error: 'No key provided' }, 400);
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
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('cache-control', 'public, max-age=31536000'); // 1 year cache

        return new Response(object.body, {
            headers,
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return c.json({ success: false, error: 'Failed to serve file' }, 500);
    }
});

export default app;
