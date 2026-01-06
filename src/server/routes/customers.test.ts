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
import customersApp from './customers'

// Mock the database module
vi.mock('../db', () => ({
    createDb: vi.fn(() => mockDb),
    customers: { id: 'id', deletedAt: 'deletedAt', createdAt: 'createdAt' },
    orders: { id: 'id', customerId: 'customerId', deletedAt: 'deletedAt', orderCustomerTotal: 'orderCustomerTotal', createdAt: 'createdAt' },
    payments: { id: 'id', customerId: 'customerId', paymentStatus: 'paymentStatus', deletedAt: 'deletedAt', paymentAmount: 'paymentAmount' },
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

describe('Customers API', () => {
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
        it('should have the customers app defined', () => {
            expect(customersApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(customersApp.routes).toBeDefined()
            expect(customersApp.routes.length).toBeGreaterThan(0)
        })

        it('should have GET / route for listing customers', () => {
            const getRoute = customersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/'
            )
            expect(getRoute).toBeDefined()
        })

        it('should have GET /:id route for single customer', () => {
            const getByIdRoute = customersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id'
            )
            expect(getByIdRoute).toBeDefined()
        })

        it('should have GET /:id/orders route for customer orders', () => {
            const ordersRoute = customersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id/orders'
            )
            expect(ordersRoute).toBeDefined()
        })

        it('should have GET /:id/balance route for customer balance', () => {
            const balanceRoute = customersApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id/balance'
            )
            expect(balanceRoute).toBeDefined()
        })

        it('should have POST / route for creating customer', () => {
            const postRoute = customersApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have PUT /:id route for updating customer', () => {
            const putRoute = customersApp.routes.find(
                (r) => r.method === 'PUT' && r.path === '/:id'
            )
            expect(putRoute).toBeDefined()
        })

        it('should have DELETE /:id route for soft delete', () => {
            const deleteRoute = customersApp.routes.find(
                (r) => r.method === 'DELETE' && r.path === '/:id'
            )
            expect(deleteRoute).toBeDefined()
        })
    })

    describe('Validation schemas', () => {
        it('should require customerName for POST request', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })

        it('should accept valid customer data', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                customerName: 'John Doe',
                customerStatus: 'active',
                createdAt: new Date().toISOString(),
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: 'John Doe',
                }),
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
        })

        it('should accept valid email format', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                customerName: 'Jane Doe',
                customerEmail: 'jane@example.com',
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: 'Jane Doe',
                    customerEmail: 'jane@example.com',
                }),
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(201)
        })

        it('should accept empty email string', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                customerName: 'Jane Doe',
                customerEmail: '',
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: 'Jane Doe',
                    customerEmail: '',
                }),
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(201)
        })

        it('should reject invalid email format', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: 'Jane Doe',
                    customerEmail: 'invalid-email',
                }),
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)
        })
    })

    describe('Customer orders', () => {
        it('should return customer orders', async () => {
            mockDb.orderBy.mockResolvedValueOnce([
                { id: 1, orderName: 'Order 1', customerId: 1 },
                { id: 2, orderName: 'Order 2', customerId: 1 },
            ])

            const req = new Request('http://localhost/1/orders', {
                method: 'GET',
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(200)

            const data = await res.json()
            expect(data.success).toBe(true)
        })

        it('should return 400 for invalid customer ID on orders', async () => {
            const req = new Request('http://localhost/invalid/orders', {
                method: 'GET',
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.error).toBe('Invalid customer ID')
        })
    })

    describe('Customer balance', () => {
        it('should calculate balance correctly', async () => {
            // Mock orders total
            mockDb.where.mockResolvedValueOnce([{ total: 5000 }])
            // Mock payments total  
            mockDb.where.mockResolvedValueOnce([{ total: 2000 }])

            const req = new Request('http://localhost/1/balance', {
                method: 'GET',
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(200)

            const data = await res.json()
            expect(data.success).toBe(true)
            expect(data.data).toHaveProperty('totalOrders')
            expect(data.data).toHaveProperty('totalPayments')
            expect(data.data).toHaveProperty('balance')
        })

        it('should return 400 for invalid customer ID on balance', async () => {
            const req = new Request('http://localhost/invalid/balance', {
                method: 'GET',
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.error).toBe('Invalid customer ID')
        })
    })

    describe('Error handling', () => {
        it('should return 400 for invalid customer ID on GET /:id', async () => {
            const req = new Request('http://localhost/invalid', {
                method: 'GET',
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invalid customer ID')
        })

        it('should return 404 for non-existent customer', async () => {
            mockDb.where.mockResolvedValueOnce([])

            const req = new Request('http://localhost/999', {
                method: 'GET',
            })

            const res = await customersApp.fetch(req, { DB: {} } as unknown as any)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Customer not found')
        })
    })
})
