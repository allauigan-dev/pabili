import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 md:px-8">
                <div className="md:hidden mr-2">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-r w-72">
                            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                            <SheetDescription className="sr-only">
                                Access navigation links, settings, and organizations.
                            </SheetDescription>
                            <SidebarContent onLinkClick={() => setOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>

                <NavLink to="/" className="flex items-center gap-2 md:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                        P
                    </div>
                    <span className="text-xl font-bold">Pabili</span>
                </NavLink>

                <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full bg-secondary">
                                <span className="text-xs font-medium">AD</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('logout')}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
