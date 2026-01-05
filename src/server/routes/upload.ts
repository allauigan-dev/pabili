/**
 * File Upload API Routes (R2)
 */

import { Hono } from 'hono';

import { AppEnv } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireOrganization } from '../middleware/organization';

const app = new Hono<AppEnv>();

// Apply middlewares
app.use('*', requireAuth);
app.use('*', requireOrganization);

// Allowed file types
// ... (rest same)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Generate unique filename
function generateFilename(originalName: string): string {
    const ext = originalName.split('.').pop() || 'jpg';
    const uuid = crypto.randomUUID();
    return `${uuid}.${ext}`;
}

// POST /api/upload - Upload file to R2
app.post('/', async (c) => {
    const organizationId = c.get('organizationId');
    try {
        const formData = await c.req.formData();
        const file = formData.get('file') as File | null;
        let folder = formData.get('folder') as string || 'temp';

        // Enforce organization isolation in storage path
        folder = `orgs/${organizationId}/${folder}`;

        if (!file) {
            return c.json({ success: false, error: 'No file provided' }, 400);
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return c.json({
                success: false,
                error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF'
            }, 400);
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return c.json({
                success: false,
                error: 'File too large. Maximum size is 10MB'
            }, 400);
        }

        // Check if R2 bucket is available
        if (!c.env.BUCKET) {
            console.error('R2 bucket not configured. Create it with: wrangler r2 bucket create pabili-uploads');
            return c.json({
                success: false,
                error: 'File storage not configured. Please configure R2 bucket.'
            }, 503);
        }

        const filename = generateFilename(file.name);
        const key = `${folder}/${filename}`;

        // Upload to R2
        await c.env.BUCKET.put(key, file.stream() as any, {
            httpMetadata: {
                contentType: file.type,
            },
            customMetadata: {
                organizationId
            }
        });

        // TODO: Generate proper public URL based on your R2 configuration
        const url = `/files/${key}`;

        return c.json({
            success: true,
            data: {
                key,
                url,
                originalFilename: file.name,
                fileSize: file.size,
                mimeType: file.type,
            },
        }, 201);
    } catch (error) {
        console.error('Error uploading file:', error);
        return c.json({ success: false, error: 'Failed to upload file' }, 500);
    }
});

// DELETE /api/upload/:key - Delete file from R2
app.delete('/:key{.+}', async (c) => {
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
        const object = await c.env.BUCKET.head(key);

        if (!object) {
            return c.json({ success: false, error: 'File not found' }, 404);
        }

        await c.env.BUCKET.delete(key);

        return c.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return c.json({ success: false, error: 'Failed to delete file' }, 500);
    }
});

export default app;

