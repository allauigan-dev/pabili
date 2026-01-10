import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrgGuard } from './OrgGuard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as authClientModule from '../lib/auth-client';

// Mock auth-client
vi.mock('../lib/auth-client', () => ({
    useSession: vi.fn(),
    useActiveOrganization: vi.fn(),
    authClient: {
        organization: {
            list: vi.fn(),
            setActive: vi.fn(),
        }
    }
}));

describe('OrgGuard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state when session is pending', () => {
        vi.mocked(authClientModule.useSession).mockReturnValue({ data: null, isPending: true } as any);
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({ data: null, isPending: false } as any);

        render(<OrgGuard />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should redirect to login when no session', () => {
        vi.mocked(authClientModule.useSession).mockReturnValue({ data: null, isPending: false } as any);
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({ data: null, isPending: false } as any);

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/protected" element={<OrgGuard />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should render outlet when active org exists', () => {
        vi.mocked(authClientModule.useSession).mockReturnValue({ data: { user: { id: '1' } }, isPending: false } as any);
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({ data: { id: 'org1' }, isPending: false } as any);

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<OrgGuard />}>
                        <Route index element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it.skip('should redirect to create organization if user has no organizations', async () => {
        vi.mocked(authClientModule.useSession).mockReturnValue({ data: { user: { id: '1' } }, isPending: false } as any);
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({ data: null, isPending: false } as any);
        vi.mocked(authClientModule.authClient.organization.list).mockResolvedValue({ data: [] } as any);

        vi.useFakeTimers();

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/protected" element={<OrgGuard />} />
                    <Route path="/organizations/new" element={<div>Create Org Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        // Retry 1
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1100);
        });
        // Retry 2
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1100);
        });
        // Retry 3
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1100);
        });

        await waitFor(() => {
            expect(screen.getByText('Create Org Page')).toBeInTheDocument();
        });

        vi.useRealTimers();
    }, 15000);
});
