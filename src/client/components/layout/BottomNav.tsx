import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    CreditCard,
    MoreHorizontal,
    Settings,
    LogOut,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '../ui/sheet';
import { OrganizationSwitcher } from '../OrganizationSwitcher';
import { authClient } from '../../lib/auth-client';

const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Orders', to: '/orders', icon: ShoppingBag },
    { label: 'Stores', to: '/stores', icon: Store },
    { label: 'Payments', to: '/payments', icon: CreditCard },
];

export const BottomNav: React.FC = () => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate("/login");
                    setIsMoreOpen(false);
                },
            },
        });
    };

    return (
        <>
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
                <button
                    onClick={() => setIsMoreOpen(true)}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 transition-colors px-3 py-1 rounded-lg",
                        isMoreOpen
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <MoreHorizontal className={cn("h-6 w-6 transition-transform", "active:scale-90")} />
                    <span className="text-[10px] font-medium transition-opacity uppercase tracking-wider">
                        More
                    </span>
                </button>
            </nav>

            <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
                    <SheetHeader className="pb-4 border-b">
                        <SheetTitle className="text-left">Menu</SheetTitle>
                    </SheetHeader>

                    <div className="py-4 space-y-4">
                        {/* Organization Switcher */}
                        <div className="px-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Organization
                            </p>
                            <OrganizationSwitcher />
                        </div>

                        {/* Additional Navigation */}
                        <div className="border-t pt-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                Quick Links
                            </p>
                            <NavLink
                                to="/customers"
                                onClick={() => setIsMoreOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-foreground hover:bg-secondary"
                                    )
                                }
                            >
                                <Users className="h-5 w-5" />
                                <span className="font-medium">Customers</span>
                            </NavLink>
                        </div>

                        {/* Settings & Logout */}
                        <div className="border-t pt-4 space-y-1">
                            <button
                                onClick={() => setIsMoreOpen(false)}
                                className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                <Settings className="h-5 w-5" />
                                <span className="font-medium">Settings</span>
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};
