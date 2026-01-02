import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from './test/utils'
import App from './App'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render the main heading', () => {
            render(<App />)
            expect(screen.getByText('Vite + React + Cloudflare')).toBeInTheDocument()
        })

        it('should render the Vite logo with link', () => {
            render(<App />)
            const viteLink = screen.getByRole('link', { name: /vite logo/i })
            expect(viteLink).toBeInTheDocument()
            expect(viteLink).toHaveAttribute('href', 'https://vite.dev')
            expect(viteLink).toHaveAttribute('target', '_blank')
        })

        it('should render the React logo with link', () => {
            render(<App />)
            const reactLink = screen.getByRole('link', { name: /react logo/i })
            expect(reactLink).toBeInTheDocument()
            expect(reactLink).toHaveAttribute('href', 'https://react.dev')
            expect(reactLink).toHaveAttribute('target', '_blank')
        })

        it('should render the Cloudflare logo with link', () => {
            render(<App />)
            const cloudflareLink = screen.getByRole('link', { name: /cloudflare logo/i })
            expect(cloudflareLink).toBeInTheDocument()
            expect(cloudflareLink).toHaveAttribute('href', 'https://workers.cloudflare.com/')
            expect(cloudflareLink).toHaveAttribute('target', '_blank')
        })
    })

    describe('Counter functionality', () => {
        it('should render initial count of 0', () => {
            render(<App />)
            const countButton = screen.getByRole('button', { name: /increment/i })
            expect(countButton).toHaveTextContent('count is 0')
        })

        it('should increment count when clicked', () => {
            render(<App />)
            const countButton = screen.getByRole('button', { name: /increment/i })

            fireEvent.click(countButton)
            expect(countButton).toHaveTextContent('count is 1')

            fireEvent.click(countButton)
            expect(countButton).toHaveTextContent('count is 2')
        })
    })

    describe('API functionality', () => {
        it('should display initial name as unknown', () => {
            render(<App />)
            const nameButton = screen.getByRole('button', { name: /get name/i })
            expect(nameButton).toHaveTextContent('Name from API is: unknown')
        })

        it('should fetch and display name from API when clicked', async () => {
            const mockName = 'Pabili'
            vi.mocked(global.fetch).mockResolvedValueOnce({
                json: () => Promise.resolve({ name: mockName }),
            } as Response)

            render(<App />)
            const nameButton = screen.getByRole('button', { name: /get name/i })

            fireEvent.click(nameButton)

            // Wait for the API call to complete and state to update
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /get name/i })).toHaveTextContent(`Name from API is: ${mockName}`)
            })

            expect(global.fetch).toHaveBeenCalledWith('/api/')
        })
    })

    describe('Informational text', () => {
        it('should display HMR instruction', () => {
            render(<App />)
            expect(screen.getAllByText(/Edit/).length).toBeGreaterThan(0)
            expect(screen.getByText('src/App.tsx')).toBeInTheDocument()
        })

        it('should display worker edit instruction', () => {
            render(<App />)
            expect(screen.getByText('worker/index.ts')).toBeInTheDocument()
        })

        it('should display learn more text', () => {
            render(<App />)
            expect(screen.getByText(/Click on the Vite and React logos to learn more/)).toBeInTheDocument()
        })
    })
})
