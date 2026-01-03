import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    CreditCard,
    Users,
    FileText,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Orders', to: '/orders', icon: ShoppingBag },
    { label: 'Stores', to: '/stores', icon: Store },
    { label: 'Payments', to: '/payments', icon: CreditCard },
    { label: 'Resellers', to: '/resellers', icon: Users },
    { label: 'Invoices', to: '/invoices', icon: FileText },
];

export const Sidebar: React.FC = () => {
    return (
        <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-card flex-col md:flex">
            <div className="flex h-16 items-center px-6 border-b">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Pabili
                </span>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
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

            <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors cursor-pointer">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                </div>
            </div>
        </aside>
    );
};
