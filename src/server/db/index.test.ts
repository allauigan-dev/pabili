import { describe, it, expect, vi } from 'vitest'
import { createDb } from './index'

// Define D1Database type for tests
type D1Database = {
    prepare: (query: string) => unknown
    batch: (statements: unknown[]) => Promise<unknown[]>
    exec: (query: string) => Promise<unknown>
    dump: () => Promise<ArrayBuffer>
}

// Mock drizzle-orm
vi.mock('drizzle-orm/d1', () => ({
    drizzle: vi.fn((db, options) => ({
        _db: db,
        _options: options,
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    })),
}))

describe('Database Module', () => {
    describe('createDb', () => {
        it('should create a database instance', () => {
            const mockD1 = {} as D1Database
            const db = createDb(mockD1 as unknown as Parameters<typeof createDb>[0])

            expect(db).toBeDefined()
            expect(db).toHaveProperty('select')
            expect(db).toHaveProperty('insert')
            expect(db).toHaveProperty('update')
            expect(db).toHaveProperty('delete')
        })

        it('should pass the D1 database to drizzle', () => {
            const mockD1 = { name: 'test-db' } as unknown as D1Database
            const db = createDb(mockD1 as unknown as Parameters<typeof createDb>[0]) as unknown as { _db: unknown }

            expect(db._db).toBe(mockD1)
        })
    })
})
