import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import * as authClientModule from '../lib/auth-client';

vi.mock('../lib/auth-client', () => ({
    useActiveOrganization: vi.fn(),
    authClient: {
        organization: {
            list: vi.fn(),
            create: vi.fn(),
            setActive: vi.fn(),
        }
    }
}));

// Mock the UI components to simplify and avoid radix-ui/pointer issues in JSDOM
vi.mock('./ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

describe('OrganizationSwitcher', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location.reload
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: vi.fn() },
        });
    });

    it('should display active organization name', async () => {
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({
            data: { id: 'org1', name: 'My Org' }
        } as any);
        vi.mocked(authClientModule.authClient.organization.list).mockResolvedValue({
            data: [{ id: 'org1', name: 'My Org' }]
        } as any);

        render(<OrganizationSwitcher />);

        expect(screen.getByText('My Org')).toBeInTheDocument();

        // Wait for effect to settle to avoid act warnings
        await waitFor(() => {
            expect(authClientModule.authClient.organization.list).toHaveBeenCalled();
        });
    });

    it('should list available organizations', async () => {
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({
            data: { id: 'org1', name: 'My Org' }
        } as any);
        vi.mocked(authClientModule.authClient.organization.list).mockResolvedValue({
            data: [
                { id: 'org1', name: 'My Org' },
                { id: 'org2', name: 'Other Org' }
            ]
        } as any);

        render(<OrganizationSwitcher />);

        await waitFor(() => {
            expect(screen.getByText('Other Org')).toBeInTheDocument();
        });
    });

    it('should switch organization when clicked', async () => {
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({
            data: { id: 'org1', name: 'My Org' }
        } as any);
        vi.mocked(authClientModule.authClient.organization.list).mockResolvedValue({
            data: [
                { id: 'org1', name: 'My Org' },
                { id: 'org2', name: 'Other Org' }
            ]
        } as any);

        vi.mocked(authClientModule.authClient.organization.setActive).mockResolvedValue({} as any);

        render(<OrganizationSwitcher />);

        await waitFor(() => {
            expect(screen.getByText('Other Org')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Other Org'));

        expect(authClientModule.authClient.organization.setActive).toHaveBeenCalledWith({
            organizationId: 'org2'
        });
        await waitFor(() => {
            expect(window.location.reload).toHaveBeenCalled();
        });
    });

    it('should create new organization when requested', async () => {
        vi.mocked(authClientModule.useActiveOrganization).mockReturnValue({
            data: { id: 'org1', name: 'My Org' }
        } as any);
        vi.mocked(authClientModule.authClient.organization.list).mockResolvedValue({
            data: [{ id: 'org1', name: 'My Org' }]
        } as any);

        vi.spyOn(window, 'prompt').mockReturnValue('New Startup');
        vi.mocked(authClientModule.authClient.organization.create).mockResolvedValue({} as any);

        render(<OrganizationSwitcher />);

        const createBtn = screen.getByText('Create New Organization');
        fireEvent.click(createBtn);

        expect(window.prompt).toHaveBeenCalled();
        expect(authClientModule.authClient.organization.create).toHaveBeenCalledWith({
            name: 'New Startup',
            slug: 'new-startup' // Slug generation logic test
        });
        await waitFor(() => {
            expect(window.location.reload).toHaveBeenCalled();
        });
    });
});
