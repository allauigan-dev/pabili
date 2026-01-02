import { describe, it, expect, vi, beforeEach } from 'vitest'
import invoicesApp from './invoices'

// Mock the database module
vi.mock('../db', () => ({
    createDb: vi.fn(() => mockDb),
    invoices: { id: 'id', deletedAt: 'deletedAt', createdAt: 'createdAt', resellerId: 'resellerId' },
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

describe('Invoices API', () => {
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
        it('should have the invoices app defined', () => {
            expect(invoicesApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(invoicesApp.routes).toBeDefined()
            expect(invoicesApp.routes.length).toBeGreaterThan(0)
        })

        it('should have GET / route for listing invoices', () => {
            const getRoute = invoicesApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/'
            )
            expect(getRoute).toBeDefined()
        })

        it('should have GET /:id route for single invoice', () => {
            const getByIdRoute = invoicesApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id'
            )
            expect(getByIdRoute).toBeDefined()
        })

        it('should have GET /:id/pdf route for PDF generation', () => {
            const pdfRoute = invoicesApp.routes.find(
                (r) => r.method === 'GET' && r.path === '/:id/pdf'
            )
            expect(pdfRoute).toBeDefined()
        })

        it('should have POST / route for creating invoice', () => {
            const postRoute = invoicesApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have PUT /:id route for updating invoice', () => {
            const putRoute = invoicesApp.routes.find(
                (r) => r.method === 'PUT' && r.path === '/:id'
            )
            expect(putRoute).toBeDefined()
        })

        it('should have PATCH /:id/status route for status update', () => {
            const patchRoute = invoicesApp.routes.find(
                (r) => r.method === 'PATCH' && r.path === '/:id/status'
            )
            expect(patchRoute).toBeDefined()
        })

        it('should have DELETE /:id route for soft delete', () => {
            const deleteRoute = invoicesApp.routes.find(
                (r) => r.method === 'DELETE' && r.path === '/:id'
            )
            expect(deleteRoute).toBeDefined()
        })
    })

    describe('Validation schemas', () => {
        it('should require resellerId for POST request', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const res = await invoicesApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)
        })

        it('should accept valid invoice data', async () => {
            mockDb.returning.mockResolvedValueOnce([{
                id: 1,
                invoiceNumber: 'INV-202601-ABCD',
                invoiceTotal: 1000,
                invoicePaid: 0,
                invoiceStatus: 'draft',
                resellerId: 1,
                createdAt: new Date().toISOString(),
            }])

            const req = new Request('http://localhost/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resellerId: 1,
                    invoiceTotal: 1000,
                }),
            })

            const res = await invoicesApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
        })
    })

    describe('Status updates', () => {
        it('should accept valid invoice status values', async () => {
            const validStatuses = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']

            for (const status of validStatuses) {
                mockDb.returning.mockResolvedValueOnce([{ id: 1, invoiceStatus: status }])

                const req = new Request('http://localhost/1/status', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                })

                const res = await invoicesApp.fetch(req, { DB: {} } as unknown as Env)
                expect(res.status).toBe(200)
            }
        })

        it('should reject invalid status values', async () => {
            const req = new Request('http://localhost/1/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'invalid_status' }),
            })

            const res = await invoicesApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)
        })
    })

    describe('PDF generation', () => {
        it('should return 501 for PDF generation (not implemented)', async () => {
            const req = new Request('http://localhost/1/pdf', {
                method: 'GET',
            })

            const res = await invoicesApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(501)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toContain('not yet implemented')
        })
    })

    describe('Error handling', () => {
        it('should return 400 for invalid invoice ID on GET /:id', async () => {
            const req = new Request('http://localhost/invalid', {
                method: 'GET',
            })

            const res = await invoicesApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invalid invoice ID')
        })

        it('should return 404 for non-existent invoice', async () => {
            mockDb.where.mockResolvedValueOnce([])

            const req = new Request('http://localhost/999', {
                method: 'GET',
            })

            const res = await invoicesApp.fetch(req, { DB: {} } as unknown as Env)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('Invoice not found')
        })
    })
})
