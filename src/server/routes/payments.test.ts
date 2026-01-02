import { describe, it, expect, vi, beforeEach } from 'vitest'
import paymentsApp from './payments'

// Mock the database module
vi.mock('../db', () => ({
    createDb: vi.fn(() => mockDb),
    payments: { id: 'id', deletedAt: 'deletedAt', createdAt: 'createdAt', resellerId: 'resellerId', paymentStatus: 'paymentStatus' },
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

describe('Payments API', () => {
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
        it('should have the payments app defined', () => {
            expect(paymentsApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(paymentsApp.routes).toBeDefined()
            expect(paymentsApp.routes.length).toBeGreaterThan(0)
        })

        it('should have GET / route for listing payments', () => {
            const getRoute = paymentsApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/'
            )
            expect(getRoute).toBeDefined()
        })

        it('should have GET /:id route for single payment', () => {
            const getByIdRoute = paymentsApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id'
            )
            expect(getByIdRoute).toBeDefined()
        })

        it('should have POST / route for recording payment', () => {
            const postRoute = paymentsApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have PUT /:id route for updating payment', () => {
            const putRoute = paymentsApp.routes.find(
                (r) => r.method === 'PUT' && r.path === '/:id'
            )
            expect(putRoute).toBeDefined()
        })

        it('should have PATCH /:id/confirm route for confirming payment', () => {
            const patchRoute = paymentsApp.routes.find(
                (r) => r.method === 'PATCH' && r.path === '/:id/confirm'
            )
            expect(patchRoute).toBeDefined()
        })

        it('should have DELETE /:id route for soft delete', () => {
            const deleteRoute = paymentsApp.routes.find(
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

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)
        })

        it('should accept valid payment data', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                paymentAmount: 500,
                paymentMethod: 'gcash',
                paymentStatus: 'pending',
                resellerId: 1,
                createdAt: new Date().toISOString(),
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentAmount: 500,
                    paymentMethod: 'gcash',
                    resellerId: 1,
                }),
            })

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
        })

        it('should accept all valid payment methods', async () => {
            const validMethods = ['cash', 'gcash', 'paymaya', 'bank_transfer', 'other']

            for (const method of validMethods) {
                mockDb.returning.mockResolvedValueOnce([{
                    id: 1,
                    paymentAmount: 100,
                    paymentMethod: method,
                    resellerId: 1,
                }])

                const req = new Request('http://localhost/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentAmount: 100,
                        paymentMethod: method,
                        resellerId: 1,
                    }),
                })

                const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
                expect(res.status).toBe(201)
            }
        })

        it('should reject invalid payment method', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentAmount: 100,
                    paymentMethod: 'bitcoin',
                    resellerId: 1,
                }),
            })

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)
        })
    })

    describe('Payment confirmation', () => {
        it('should confirm payment successfully', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                paymentStatus: 'confirmed',
            }])

            const req = new Request('http://localhost/1/confirm', {
                method: 'PATCH',
            })

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(200)

            const data = await res.json()
            expect(data.success).toBe(true)
        })

        it('should return 404 for confirming non-existent payment', async () => {
            mockDb.returning.mockResolvedValueOnce([])

            const req = new Request('http://localhost/999/confirm', {
                method: 'PATCH',
            })

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.error).toBe('Payment not found')
        })
    })

    describe('Error handling', () => {
        it('should return 400 for invalid payment ID on GET /:id', async () => {
            const req = new Request('http://localhost/invalid', {
                method: 'GET',
            })

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invalid payment ID')
        })

        it('should return 404 for non-existent payment', async () => {
            mockDb.where.mockResolvedValueOnce([])

            const req = new Request('http://localhost/999', {
                method: 'GET',
            })

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Payment not found')
        })

        it('should require positive payment amount', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentAmount: -100,
                    resellerId: 1,
                }),
            })

            const res = await paymentsApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)
        })
    })
})
