import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    CreditCard,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Orders', to: '/orders', icon: ShoppingBag },
    { label: 'Stores', to: '/stores', icon: Store },
    { label: 'Payments', to: '/payments', icon: CreditCard },
    { label: 'Resellers', to: '/resellers', icon: Users },
];

export const BottomNav: React.FC = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card/80 backdrop-blur-lg md:hidden px-2 pb-safe">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors px-3 py-1 rounded-lg",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )
                    }
                >
                    <item.icon className={cn("h-6 w-6 transition-transform", "active:scale-90")} />
                    <span className="text-[10px] font-medium transition-opacity uppercase tracking-wider">
                        {item.label}
                    </span>
                </NavLink>
            ))}
        </nav>
    );
};
