import { describe, it, expect } from 'vitest'
import { render as baseRender, screen, waitFor } from '@testing-library/react'
import App from './App'

// Mock sub-components that use hooks to avoid full hook execution if not needed
// or just let them render since we use msw/mock-fetch in other tests
// For this smoke test, we'll just check if it renders the main parts

describe('App Component', () => {
    it('should render effectively', async () => {
        baseRender(<App />)

        // Check for Sidebar brand
        expect(screen.getByText('Pabili')).toBeInTheDocument()

        // Wait for Dashboard content
        await waitFor(() => {
            expect(screen.getByText(/Mabuhay/i)).toBeInTheDocument()
        })
    })

    it('should show the navigation items', () => {
        baseRender(<App />)

        // Sidebar/BottomNav items
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Orders').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Stores').length).toBeGreaterThan(0)
    })
})
