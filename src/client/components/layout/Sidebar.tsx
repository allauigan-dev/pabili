import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    CreditCard,
    Users,
    FileText,
    Settings,
    LogOut,
    Moon,
    Sun,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrganizationSwitcher } from '../OrganizationSwitcher';
import { authClient } from '../../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Orders', to: '/orders', icon: ShoppingBag },
    { label: 'Stores', to: '/stores', icon: Store },
    { label: 'Payments', to: '/payments', icon: CreditCard },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Invoices', to: '/invoices', icon: FileText },
];


export const SidebarContent: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
    const navigate = useNavigate();
    const { isDark, toggleTheme, isAmoled, toggleAmoled } = useTheme();

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
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6 border-b">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Pabili
                </span>
            </div>

            <div className="p-4 border-b bg-slate-50/50 dark:bg-secondary/30">
                <OrganizationSwitcher />
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t space-y-2">
                <div
                    className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors cursor-pointer text-sm"
                    onClick={() => {
                        navigate('/settings');
                        onLinkClick?.();
                    }}
                >
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Settings</span>
                </div>
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors text-sm"
                >
                    {isDark ? (
                        <>
                            <Sun className="h-4 w-4" />
                            <span className="font-medium">Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className="h-4 w-4" />
                            <span className="font-medium">Dark Mode</span>
                        </>
                    )}
                </button>
                {isDark && (
                    <button
                        onClick={toggleAmoled}
                        className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors text-sm"
                    >
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium">AMOLED Mode {isAmoled ? '(On)' : '(Off)'}</span>
                    </button>
                )}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-sm"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export const Sidebar: React.FC = () => {
    return (
        <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-card flex-col md:flex">
            <SidebarContent />
        </aside>
    );
};
