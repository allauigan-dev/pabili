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

import shipmentsApp from './shipments'

// Mock the database module
vi.mock('../db', () => ({
    createDb: vi.fn(() => mockDb),
    shipments: {
        id: 'id',
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
        customerId: 'customerId',
        organizationId: 'organizationId',
        shipmentStatus: 'shipmentStatus',
    },
    orders: {
        id: 'id',
        deletedAt: 'deletedAt',
        shipmentId: 'shipmentId',
        organizationId: 'organizationId',
        customerId: 'customerId',
    },
    customers: { id: 'id', customerName: 'customerName' },
    organization: { id: 'id', slug: 'slug', name: 'name' },
}))

// Mock database instance
const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    leftJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
}

describe('Shipments API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockDb.select.mockReturnThis()
        mockDb.from.mockReturnThis()
        mockDb.where.mockReturnThis()
        mockDb.orderBy.mockResolvedValue([])
        mockDb.leftJoin.mockReturnThis()
        mockDb.limit.mockReturnThis()
        mockDb.offset.mockResolvedValue([])
        mockDb.insert.mockReturnThis()
        mockDb.values.mockReturnThis()
        mockDb.update.mockReturnThis()
        mockDb.set.mockReturnThis()
        mockDb.returning.mockResolvedValue([])
    })

    describe('Route definitions', () => {
        it('should have the shipments app defined', () => {
            expect(shipmentsApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(shipmentsApp.routes).toBeDefined()
            expect(shipmentsApp.routes.length).toBeGreaterThan(0)
        })

        it('should have GET / route for listing shipments', () => {
            const getRoute = shipmentsApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/'
            )
            expect(getRoute).toBeDefined()
        })

        it('should have GET /counts route for shipment counts', () => {
            const countsRoute = shipmentsApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/counts'
            )
            expect(countsRoute).toBeDefined()
        })

        it('should have GET /:id route for single shipment', () => {
            const getByIdRoute = shipmentsApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id'
            )
            expect(getByIdRoute).toBeDefined()
        })

        it('should have POST / route for creating shipment', () => {
            const postRoute = shipmentsApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have PUT /:id route for updating shipment', () => {
            const putRoute = shipmentsApp.routes.find(
                (r) => r.method === 'PUT' && r.path === '/:id'
            )
            expect(putRoute).toBeDefined()
        })

        it('should have PATCH /:id/status route for status update', () => {
            const patchRoute = shipmentsApp.routes.find(
                (r) => r.method === 'PATCH' && r.path === '/:id/status'
            )
            expect(patchRoute).toBeDefined()
        })

        it('should have POST /:id/orders route for adding orders', () => {
            const addOrdersRoute = shipmentsApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/:id/orders'
            )
            expect(addOrdersRoute).toBeDefined()
        })

        it('should have DELETE /:id/orders/:orderId route for removing orders', () => {
            const removeOrderRoute = shipmentsApp.routes.find(
                (r) => r.method === 'DELETE' && r.path === '/:id/orders/:orderId'
            )
            expect(removeOrderRoute).toBeDefined()
        })

        it('should have DELETE /:id route for soft delete', () => {
            const deleteRoute = shipmentsApp.routes.find(
                (r) => r.method === 'DELETE' && r.path === '/:id'
            )
            expect(deleteRoute).toBeDefined()
        })
    })

    describe('Validation schemas', () => {
        it('should require mandatory fields for POST request', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const res = await shipmentsApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })

        it('should require at least one order for creating shipment', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: 1,
                    orderIds: [], // Empty array should fail
                }),
            })

            const res = await shipmentsApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })
    })

    describe('Status updates', () => {
        it('should accept valid status values', async () => {
            const validStatuses = ['preparing', 'ready', 'in_transit', 'delivered', 'cancelled']

            for (const status of validStatuses) {
                mockDb.returning.mockResolvedValueOnce([{ id: 1, shipmentStatus: status }])

                const req = new Request('http://localhost/1/status', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                })

                const res = await shipmentsApp.fetch(req, { DB: {} } as unknown as any)
                expect(res.status).toBe(200)
            }
        })

        it('should reject invalid status values', async () => {
            const req = new Request('http://localhost/1/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'invalid_status' }),
            })

            const res = await shipmentsApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })
    })

    describe('Error handling', () => {
        it('should return 400 for invalid shipment ID on GET /:id', async () => {
            const req = new Request('http://localhost/invalid', {
                method: 'GET',
            })

            const res = await shipmentsApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invalid shipment ID')
        })
    })
})
