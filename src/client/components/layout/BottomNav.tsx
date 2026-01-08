import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    MoreHorizontal,
    Settings,
    LogOut,
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
import { useNavConfig } from '@/hooks/useNavConfig';

export const BottomNav: React.FC = () => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const navigate = useNavigate();
    const { bottomNavItems, moreMenuItems } = useNavConfig();

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

    const location = useLocation();
    const isFormPage = location.pathname.endsWith('/new') || location.pathname.endsWith('/edit');

    if (isFormPage) {
        return null;
    }

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card/80 backdrop-blur-lg lg:hidden px-2 pb-safe">
                {bottomNavItems.map((item) => (
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
                        "flex flex-col items-center justify-center gap-1 transition-colors px-3 py-1 rounded-lg relative",
                        isMoreOpen
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <MoreHorizontal className={cn("h-6 w-6 transition-transform", "active:scale-90")} />
                    <span className="text-[10px] font-medium transition-opacity uppercase tracking-wider">
                        More
                    </span>
                    {moreMenuItems.length > 0 && (
                        <span className="absolute top-0 right-2 w-2 h-2 bg-primary rounded-full" />
                    )}
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

                        {/* Additional Navigation Items (not in bottom nav) */}
                        {moreMenuItems.length > 0 && (
                            <div className="border-t pt-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                    More Pages
                                </p>
                                {moreMenuItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
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
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )}

                        {/* Settings & Logout */}
                        <div className="border-t pt-4 space-y-1">
                            <button
                                onClick={() => { navigate('/settings'); setIsMoreOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                <Settings className="h-5 w-5" />
                                <span className="font-medium">Settings</span>
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
