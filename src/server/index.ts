/**
 * Pabili API Server
 * Main entry point for Hono API routes
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import routes
import customersRoutes from './routes/customers';
import storesRoutes from './routes/stores';
import ordersRoutes from './routes/orders';
import paymentsRoutes from './routes/payments';
import invoicesRoutes from './routes/invoices';
import uploadRoutes from './routes/upload';
import filesRoutes from './routes/files';
import activitiesRoutes from './routes/activities';
import statsRoutes from './routes/stats';

import { authMiddleware } from './middleware/auth';
import { getAuth } from './lib/auth';

import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', authMiddleware);

// Mount Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
    console.log(`[BetterAuth] ${c.req.method} ${c.req.url}`);
    const auth = getAuth(c.env);
    return auth.handler(c.req.raw);
});

// Health check
app.get('/api/health', (c) => {
    return c.json({
        success: true,
        message: 'Pabili API is running',
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
app.route('/api/orders', ordersRoutes);
app.route('/api/stores', storesRoutes);
app.route('/api/customers', customersRoutes);
app.route('/api/payments', paymentsRoutes);
app.route('/api/invoices', invoicesRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/activities', activitiesRoutes);
app.route('/api/stats', statsRoutes);
app.route('/files', filesRoutes);

// 404 handler for API routes
app.notFound((c) => {
    return c.json({
        success: false,
        error: 'API endpoint not found'
    }, 404);
});

// Error handler
app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json({
        success: false,
        error: 'Internal server error'
    }, 500);
});

export default app;
