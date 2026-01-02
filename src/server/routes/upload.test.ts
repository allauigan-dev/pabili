import { describe, it, expect, vi, beforeEach } from 'vitest'
import uploadApp from './upload'

// Mock R2 bucket
const mockBucket = {
    put: vi.fn().mockResolvedValue({}),
    head: vi.fn().mockResolvedValue({ key: 'test/file.jpg' }),
    delete: vi.fn().mockResolvedValue(undefined),
}

describe('Upload API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockBucket.put.mockResolvedValue({})
        mockBucket.head.mockResolvedValue({ key: 'test/file.jpg' })
        mockBucket.delete.mockResolvedValue(undefined)
    })

    describe('Route definitions', () => {
        it('should have the upload app defined', () => {
            expect(uploadApp).toBeDefined()
        })

        it('should have routes defined', () => {
            expect(uploadApp.routes).toBeDefined()
            expect(uploadApp.routes.length).toBeGreaterThan(0)
        })

        it('should have POST / route for uploading files', () => {
            const postRoute = uploadApp.routes.find(
                (r) => r.method === 'POST' && r.path === '/'
            )
            expect(postRoute).toBeDefined()
        })

        it('should have DELETE /:key route for deleting files', () => {
            const deleteRoute = uploadApp.routes.find(
                (r) => r.method === 'DELETE'
            )
            expect(deleteRoute).toBeDefined()
        })
    })

    describe('File upload validation', () => {
        it('should return 400 when no file is provided', async () => {
            const formData = new FormData()

            const req = new Request('http://localhost/', {
                method: 'POST',
                body: formData,
            })

            const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('No file provided')
        })

        it('should return 400 for invalid file type', async () => {
            const formData = new FormData()
            const invalidFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
            formData.append('file', invalidFile)

            const req = new Request('http://localhost/', {
                method: 'POST',
                body: formData,
            })

            const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toContain('Invalid file type')
        })

        it('should accept valid image types', async () => {
            const validTypes = [
                { type: 'image/jpeg', ext: 'jpg' },
                { type: 'image/png', ext: 'png' },
                { type: 'image/webp', ext: 'webp' },
                { type: 'image/gif', ext: 'gif' },
            ]

            for (const { type, ext } of validTypes) {
                const formData = new FormData()
                const file = new File(['test content'], `test.${ext}`, { type })
                formData.append('file', file)

                const req = new Request('http://localhost/', {
                    method: 'POST',
                    body: formData,
                })

                const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
                expect(res.status).toBe(201)

                const data = await res.json()
                expect(data.success).toBe(true)
                expect(data.data).toHaveProperty('key')
                expect(data.data).toHaveProperty('url')
            }
        })

        it('should return 400 for files larger than 10MB', async () => {
            const formData = new FormData()
            // Create a file larger than 10MB (10 * 1024 * 1024 bytes)
            const largeContent = new ArrayBuffer(10 * 1024 * 1024 + 1)
            const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
            formData.append('file', largeFile)

            const req = new Request('http://localhost/', {
                method: 'POST',
                body: formData,
            })

            const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toContain('File too large')
        })
    })

    describe('File upload success', () => {
        it('should upload file with default folder', async () => {
            const formData = new FormData()
            const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
            formData.append('file', file)

            const req = new Request('http://localhost/', {
                method: 'POST',
                body: formData,
            })

            const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
            expect(data.data.key).toContain('temp/')
            expect(data.data).toHaveProperty('originalFilename')
            expect(data.data.mimeType).toBe('image/jpeg')
        })

        it('should upload file with custom folder', async () => {
            const formData = new FormData()
            const file = new File(['test content'], 'test.png', { type: 'image/png' })
            formData.append('file', file)
            formData.append('folder', 'orders/123')

            const req = new Request('http://localhost/', {
                method: 'POST',
                body: formData,
            })

            const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.success).toBe(true)
            expect(data.data.key).toContain('orders/123/')
        })
    })

    describe('File deletion', () => {
        it('should delete existing file', async () => {
            const req = new Request('http://localhost/orders/123/test.jpg', {
                method: 'DELETE',
            })

            const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
            expect(res.status).toBe(200)

            const data = await res.json()
            expect(data.success).toBe(true)
            expect(data.message).toBe('File deleted successfully')
        })

        it('should return 404 for non-existent file', async () => {
            mockBucket.head.mockResolvedValueOnce(null)

            const req = new Request('http://localhost/nonexistent/file.jpg', {
                method: 'DELETE',
            })

            const res = await uploadApp.fetch(req, { BUCKET: mockBucket } as unknown as Env)
            expect(res.status).toBe(404)

            const data = await res.json()
            expect(data.success).toBe(false)
            expect(data.error).toBe('File not found')
        })
    })
})
