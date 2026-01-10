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

import ordersApp from './orders'

// Mock the database module
vi.mock('../db', () => ({
    createDb: vi.fn(() => mockDb),
    orders: { id: 'id', deletedAt: 'deletedAt', createdAt: 'createdAt', customerId: 'customerId', storeId: 'storeId', organizationId: 'organizationId' },
    stores: { id: 'id', storeName: 'storeName' },
    customers: { id: 'id', customerName: 'customerName' },
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

describe('Orders API', () => {
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
        it('should have the orders app defined', () => {
            expect(ordersApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(ordersApp.routes).toBeDefined()
            expect(ordersApp.routes.length).toBeGreaterThan(0)
        })

        it('should have GET / route for listing orders', () => {
            const getRoute = ordersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/'
            )
            expect(getRoute).toBeDefined()
        })

        it('should have GET /:id route for single order', () => {
            const getByIdRoute = ordersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id'
            )
            expect(getByIdRoute).toBeDefined()
        })

        it('should have POST / route for creating order', () => {
            const postRoute = ordersApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have PUT /:id route for updating order', () => {
            const putRoute = ordersApp.routes.find(
                (r) => r.method === 'PUT' && r.path === '/:id'
            )
            expect(putRoute).toBeDefined()
        })

        it('should have PATCH /:id/status route for status update', () => {
            const patchRoute = ordersApp.routes.find(
                (r) => r.method === 'PATCH' && r.path === '/:id/status'
            )
            expect(patchRoute).toBeDefined()
        })

        it('should have DELETE /:id route for soft delete', () => {
            const deleteRoute = ordersApp.routes.find(
                (r) => r.method === 'DELETE' && r.path === '/:id'
            )
            expect(deleteRoute).toBeDefined()
        })

        it('should have GET /buy-list route for grouped pending orders', () => {
            const buyListRoute = ordersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/buy-list'
            )
            expect(buyListRoute).toBeDefined()
        })
    })

    describe('Validation schemas', () => {
        it('should require mandatory fields for POST request', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const res = await ordersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })

        it('should accept valid order data', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                orderNumber: 'ORD-123-ABC',
                orderName: 'Test Order',
                orderQuantity: 2,
                orderPrice: 100,
                orderFee: 10,
                orderCustomerPrice: 120,
                orderTotal: 220,
                orderCustomerTotal: 240,
                storeId: 1,
                customerId: 1,
                createdAt: new Date().toISOString(),
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderName: 'Test Order',
                    orderQuantity: 2,
                    orderPrice: 100,
                    orderFee: 10,
                    orderCustomerPrice: 120,
                    storeId: 1,
                    customerId: 1,
                }),
            })

            const res = await ordersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
        })
    })

    describe('Status updates', () => {
        it('should accept valid status values', async () => {
            const validStatuses = ['pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock']

            for (const status of validStatuses) {
                mockDb.returning.mockResolvedValueOnce([{ id: 1, orderStatus: status }])

                const req = new Request('http://localhost/1/status', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                })

                const res = await ordersApp.fetch(req, { DB: {} } as unknown as any)
                expect(res.status).toBe(200)
            }
        })

        it('should reject invalid status values', async () => {
            const req = new Request('http://localhost/1/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'invalid_status' }),
            })

            const res = await ordersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })
    })

    describe('Error handling', () => {
        it('should return 400 for invalid order ID on GET /:id', async () => {
            const req = new Request('http://localhost/invalid', {
                method: 'GET',
            })

            const res = await ordersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invalid order ID')
        })

        it('should return 404 for non-existent order', async () => {
            mockDb.where.mockResolvedValueOnce([])

            const req = new Request('http://localhost/999', {
                method: 'GET',
            })

            const res = await ordersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Order not found')
        })
    })
})
