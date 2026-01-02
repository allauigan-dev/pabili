/**
 * Pabili API Server
 * Main entry point for Hono API routes
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import routes
import ordersRoutes from './routes/orders';
import storesRoutes from './routes/stores';
import resellersRoutes from './routes/resellers';
import paymentsRoutes from './routes/payments';
import invoicesRoutes from './routes/invoices';
import uploadRoutes from './routes/upload';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());

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
app.route('/api/resellers', resellersRoutes);
app.route('/api/payments', paymentsRoutes);
app.route('/api/invoices', invoicesRoutes);
app.route('/api/upload', uploadRoutes);

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
