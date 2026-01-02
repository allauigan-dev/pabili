import { describe, it, expect, vi, beforeEach } from 'vitest'
import resellersApp from './resellers'

// Mock the database module
vi.mock('../db', () => ({
    createDb: vi.fn(() => mockDb),
    resellers: { id: 'id', deletedAt: 'deletedAt', createdAt: 'createdAt' },
    orders: { id: 'id', resellerId: 'resellerId', deletedAt: 'deletedAt', orderResellerTotal: 'orderResellerTotal', createdAt: 'createdAt' },
    payments: { id: 'id', resellerId: 'resellerId', paymentStatus: 'paymentStatus', deletedAt: 'deletedAt', paymentAmount: 'paymentAmount' },
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

describe('Resellers API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
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
        it('should have the resellers app defined', () => {
            expect(resellersApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(resellersApp.routes).toBeDefined()
            expect(resellersApp.routes.length).toBeGreaterThan(0)
        })

        it('should have GET / route for listing resellers', () => {
            const getRoute = resellersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/'
            )
            expect(getRoute).toBeDefined()
        })

        it('should have GET /:id route for single reseller', () => {
            const getByIdRoute = resellersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id'
            )
            expect(getByIdRoute).toBeDefined()
        })

        it('should have GET /:id/orders route for reseller orders', () => {
            const ordersRoute = resellersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id/orders'
            )
            expect(ordersRoute).toBeDefined()
        })

        it('should have GET /:id/balance route for reseller balance', () => {
            const balanceRoute = resellersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id/balance'
            )
            expect(balanceRoute).toBeDefined()
        })

        it('should have POST / route for creating reseller', () => {
            const postRoute = resellersApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have PUT /:id route for updating reseller', () => {
            const putRoute = resellersApp.routes.find(
                (r) => r.method === 'PUT' && r.path === '/:id'
            )
            expect(putRoute).toBeDefined()
        })

        it('should have DELETE /:id route for soft delete', () => {
            const deleteRoute = resellersApp.routes.find(
                (r) => r.method === 'DELETE' && r.path === '/:id'
            )
            expect(deleteRoute).toBeDefined()
        })
    })

    describe('Validation schemas', () => {
        it('should require resellerName for POST request', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)
        })

        it('should accept valid reseller data', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                resellerName: 'John Doe',
                resellerStatus: 'active',
                createdAt: new Date().toISOString(),
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resellerName: 'John Doe',
                }),
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
        })

        it('should accept valid email format', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                resellerName: 'Jane Doe',
                resellerEmail: 'jane@example.com',
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resellerName: 'Jane Doe',
                    resellerEmail: 'jane@example.com',
                }),
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(201)
        })

        it('should accept empty email string', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                resellerName: 'Jane Doe',
                resellerEmail: '',
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resellerName: 'Jane Doe',
                    resellerEmail: '',
                }),
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(201)
        })

        it('should reject invalid email format', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resellerName: 'Jane Doe',
                    resellerEmail: 'invalid-email',
                }),
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)
        })
    })

    describe('Reseller orders', () => {
        it('should return reseller orders', async () => {
            mockDb.orderBy.mockResolvedValueOnce([
                { id: 1, orderName: 'Order 1', resellerId: 1 },
                { id: 2, orderName: 'Order 2', resellerId: 1 },
            ])

            const req = new Request('http://localhost/1/orders', {
                method: 'GET',
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(200)

            const data = await res.json()
            expect(data.success).toBe(true)
        })

        it('should return 400 for invalid reseller ID on orders', async () => {
            const req = new Request('http://localhost/invalid/orders', {
                method: 'GET',
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.error).toBe('Invalid reseller ID')
        })
    })

    describe('Reseller balance', () => {
        it('should calculate balance correctly', async () => {
            // Mock orders total
            mockDb.where.mockResolvedValueOnce([{ total: 5000 }])
            // Mock payments total  
            mockDb.where.mockResolvedValueOnce([{ total: 2000 }])

            const req = new Request('http://localhost/1/balance', {
                method: 'GET',
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(200)

            const data = await res.json()
            expect(data.success).toBe(true)
            expect(data.data).toHaveProperty('totalOrders')
            expect(data.data).toHaveProperty('totalPayments')
            expect(data.data).toHaveProperty('balance')
        })

        it('should return 400 for invalid reseller ID on balance', async () => {
            const req = new Request('http://localhost/invalid/balance', {
                method: 'GET',
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.error).toBe('Invalid reseller ID')
        })
    })

    describe('Error handling', () => {
        it('should return 400 for invalid reseller ID on GET /:id', async () => {
            const req = new Request('http://localhost/invalid', {
                method: 'GET',
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invalid reseller ID')
        })

        it('should return 404 for non-existent reseller', async () => {
            mockDb.where.mockResolvedValueOnce([])

            const req = new Request('http://localhost/999', {
                method: 'GET',
            })

            const res = await resellersApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Reseller not found')
        })
    })
})
