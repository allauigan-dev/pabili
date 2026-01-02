/**
 * Environment Types for Cloudflare Workers
 */

interface Env {
    // D1 Database
    DB: D1Database;

    // R2 Bucket
    BUCKET: R2Bucket;

    // Environment variables (optional)
    // APP_ENV?: string;
}
