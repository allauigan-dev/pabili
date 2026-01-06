import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock middlewares before importing the app
vi.mock('../middleware/auth', () => ({
    requireAuth: vi.fn(async (c, next) => {
        c.set('user', { id: 'test-user' });
        return next();
    })
}))

vi.mock('../middleware/organization', () => ({
    requireOrganization: vi.fn(async (c, next) => {
        c.set('organizationId', 'test-org');
        return next();
    })
}))

import storesApp from './stores'

// Mock the database module
vi.mock('../db', () => ({
    createDb: vi.fn(() => mockDb),
    stores: { id: 'id', deletedAt: 'deletedAt', createdAt: 'createdAt' },
}))

// Mock database instance
const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
}

describe('Stores API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset mock implementations
        mockDb.select.mockReturnThis()
        mockDb.from.mockReturnThis()
        mockDb.where.mockReturnThis()
        mockDb.orderBy.mockResolvedValue([])
        mockDb.insert.mockReturnThis()
        mockDb.values.mockReturnThis()
        mockDb.update.mockReturnThis()
        mockDb.set.mockReturnThis()
        mockDb.returning.mockResolvedValue([])
    })

    describe('Route definitions', () => {
        it('should have the stores app defined', () => {
            expect(storesApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(storesApp.routes).toBeDefined()
            expect(storesApp.routes.length).toBeGreaterThan(0)
        })

        it('should have GET / route for listing stores', () => {
            const getRoute = storesApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/'
            )
            expect(getRoute).toBeDefined()
        })

        it('should have GET /:id route for single store', () => {
            const getByIdRoute = storesApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id'
            )
            expect(getByIdRoute).toBeDefined()
        })

        it('should have POST / route for creating store', () => {
            const postRoute = storesApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have PUT /:id route for updating store', () => {
            const putRoute = storesApp.routes.find(
                (r) => r.method === 'PUT' && r.path === '/:id'
            )
            expect(putRoute).toBeDefined()
        })

        it('should have DELETE /:id route for soft delete', () => {
            const deleteRoute = storesApp.routes.find(
                (r) => r.method === 'DELETE' && r.path === '/:id'
            )
            expect(deleteRoute).toBeDefined()
        })
    })

    describe('Validation schemas', () => {
        it('should require storeName for POST request', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const res = await storesApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })

        it('should accept valid store data', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                storeName: 'Test Store',
                storeStatus: 'active',
                createdAt: new Date().toISOString(),
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName: 'Test Store',
                }),
            })

            const res = await storesApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
        })
    })

    describe('Error handling', () => {
        it('should return 400 for invalid store ID on GET /:id', async () => {
            const req = new Request('http://localhost/invalid', {
                method: 'GET',
            })

            const res = await storesApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invalid store ID')
        })

        it('should return 404 for non-existent store', async () => {
            mockDb.where.mockResolvedValueOnce([])

            const req = new Request('http://localhost/999', {
                method: 'GET',
            })

            const res = await storesApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Store not found')
        })
    })
})
