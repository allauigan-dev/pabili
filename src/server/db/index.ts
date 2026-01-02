/**
 * Database Connection
 * Drizzle ORM instance for D1
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
    return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;

// Re-export schema for convenience
export * from './schema';
