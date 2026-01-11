import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingBasket,
    Store,
    CreditCard,
    Users,
    FileText,
    Settings,
    LogOut,
    Moon,
    Sun,
    PanelLeftClose,
    PanelLeftOpen,
    PackageCheck,
    Truck,
    MapPinned
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrganizationSwitcher } from '../OrganizationSwitcher';
import { authClient } from '../../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useSidebar } from './SidebarProvider';
import { useSession } from '@/lib/auth-client';
import { getGenderImagePaths, type Gender } from '@/hooks/useGenderIcon';

const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Orders', to: '/orders', icon: ShoppingBag },
    { label: 'Buy List', to: '/buy-list', icon: ShoppingBasket },
    { label: 'Packaging', to: '/packaging', icon: PackageCheck },
    { label: 'Shipments', to: '/shipments', icon: Truck },
    { label: 'Tracking', to: '/tracking', icon: MapPinned },
    { label: 'Stores', to: '/stores', icon: Store },
    { label: 'Payments', to: '/payments', icon: CreditCard },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Invoices', to: '/invoices', icon: FileText },
];


export const SidebarContent: React.FC<{ onLinkClick?: () => void, isMobile?: boolean }> = ({ onLinkClick, isMobile }) => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { isCollapsed, toggleCollapsed } = useSidebar();
    const { data: session } = useSession();
    const user = session?.user;
    const genderImages = getGenderImagePaths((user as { gender?: Gender })?.gender);

    // Use actual collapsed state for desktop, always expanded for mobile
    const collapsed = isMobile ? false : isCollapsed;

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate("/login");
                    onLinkClick?.();
                },
            },
        });
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className={cn(
                "flex h-16 items-center border-b transition-all duration-300 justify-center",
                collapsed ? "px-0" : "px-6"
            )}>
                <div className="app-header-logo-icon shrink-0 bg-transparent overflow-hidden">
                    <img src={genderImages.small} alt="Pabili" className="h-full w-full object-cover" />
                </div>
            </div>

            <div className={cn(
                "p-4 border-b bg-slate-50/50 dark:bg-secondary/30 transition-all",
                collapsed ? "px-2" : "px-4"
            )}>
                <OrganizationSwitcher isCollapsed={collapsed} />
            </div>

            <nav className="flex-1 space-y-1 p-4 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 py-2 rounded-md transition-all duration-300",
                                collapsed ? "justify-center px-0" : "px-3",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                            <span className="font-medium truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                {item.label}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className={cn(
                "p-4 border-t space-y-2 mt-auto",
                collapsed ? "px-2" : "px-4"
            )}>
                <div
                    className={cn(
                        "flex items-center gap-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-all cursor-pointer text-sm",
                        collapsed ? "justify-center px-0" : "px-3"
                    )}
                    onClick={() => {
                        navigate('/settings');
                        onLinkClick?.();
                    }}
                >
                    <Settings className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="font-medium animate-in fade-in duration-300">Settings</span>}
                </div>

                {!isMobile && (
                    <button
                        onClick={toggleCollapsed}
                        className={cn(
                            "flex items-center gap-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-all text-sm w-full",
                            collapsed ? "justify-center px-0" : "px-3"
                        )}
                    >
                        {collapsed ? (
                            <PanelLeftOpen className="h-4 w-4 shrink-0" />
                        ) : (
                            <>
                                <PanelLeftClose className="h-4 w-4 shrink-0" />
                                <span className="font-medium animate-in fade-in duration-300">Collapse</span>
                            </>
                        )}
                    </button>
                )}

                <button
                    onClick={toggleTheme}
                    className={cn(
                        "w-full flex items-center gap-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-all text-sm",
                        collapsed ? "justify-center px-0" : "px-3"
                    )}
                >
                    {isDark ? (
                        <>
                            <Sun className="h-4 w-4 shrink-0" />
                            {!collapsed && <span className="font-medium animate-in fade-in duration-300">Light Mode</span>}
                        </>
                    ) : (
                        <>
                            <Moon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span className="font-medium animate-in fade-in duration-300">Dark Mode</span>}
                        </>
                    )}
                </button>

                <button
                    onClick={handleSignOut}
                    className={cn(
                        "w-full flex items-center gap-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all text-sm",
                        collapsed ? "justify-center px-0" : "px-3"
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="font-medium animate-in fade-in duration-300">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export const Sidebar: React.FC = () => {
    const { isCollapsed } = useSidebar();
    return (
        <aside className={cn(
            "fixed left-0 top-0 hidden h-full border-r bg-card flex-col lg:flex transition-all duration-300 z-40",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <SidebarContent />
        </aside>
    );
};
