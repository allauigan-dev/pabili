import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Search, X, Moon, Sun, Smartphone } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
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
import { useHeader } from './HeaderProvider';
import { Input } from '@/components/ui/input';
import { useSession, signOut } from '@/lib/auth-client';
import { getGenderImagePaths, type Gender } from '@/hooks/useGenderIcon';


export const Header: React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const { isDark, toggleTheme, isAmoled, toggleAmoled } = useTheme();
    const {
        title,
        actions,
        showSearch,
        searchQuery,
        setSearchQuery,
        searchPlaceholder,
        filterContent,
        onSearchChangeRef
    } = useHeader();
    const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

    // Get user session for profile image
    const { data: session } = useSession();
    const user = session?.user;
    const userImage = user?.image;
    const genderImages = getGenderImagePaths((user as { gender?: Gender })?.gender);
    const [imageError, setImageError] = useState(false);

    // Reset image error when user image changes
    useEffect(() => {
        setImageError(false);
    }, [userImage]);

    // Scroll hide behavior
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const mainElement = document.querySelector('.app-main');
        if (!mainElement) return;

        const handleScroll = () => {
            const currentScrollY = mainElement.scrollTop;
            const scrollDiff = currentScrollY - lastScrollY.current;

            // Only hide if we've scrolled down more than 10px and are past 50px from top
            if (scrollDiff > 10 && currentScrollY > 50) {
                setIsHidden(true);
            }
            // Show if scrolling up more than 5px
            else if (scrollDiff < -5) {
                setIsHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        mainElement.addEventListener('scroll', handleScroll, { passive: true });
        return () => mainElement.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`app-header transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className="app-header-container">
                {/* Mobile Menu & Logo */}
                <div className="flex items-center">
                    <div className="lg:hidden">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <button className="flex items-center gap-2 mr-2">
                                    <div className="app-header-logo-icon cursor-pointer hover:opacity-80 transition-opacity bg-transparent overflow-hidden">
                                        <img src={genderImages.small} alt="Pabili" className="h-full w-full object-cover" />
                                    </div>
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 border-r w-72">
                                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Access navigation links, settings, and organizations.
                                </SheetDescription>
                                <SidebarContent onLinkClick={() => setOpen(false)} isMobile={true} />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Logo */}
                    <NavLink to="/" className="hidden lg:flex items-center gap-2">
                        <h1 className="text-lg font-bold truncate max-w-[120px] sm:max-w-none">
                            {title}
                        </h1>
                    </NavLink>

                    {/* Mobile Title */}
                    {!isMobileSearchVisible && (
                        <div className="flex-1 min-w-0 flex items-center lg:hidden">
                            <h1 className="text-lg font-bold truncate">
                                {title}
                            </h1>
                        </div>
                    )}
                </div>

                {/* Search Bar - Desktop Only */}
                <div className={`flex-1 max-w-md mx-4 transition-all duration-300 ${showSearch ? 'opacity-100' : 'opacity-0 pointer-events-none'} hidden lg:flex`}>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-10 pr-10 h-10 w-full bg-secondary/50 border-none rounded-xl focus-visible:ring-primary"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                onSearchChangeRef.current?.(e.target.value);
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    onSearchChangeRef.current?.('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="app-header-actions">
                    {showSearch && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileSearchVisible(true)}
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    )}

                    {actions}

                    <div className="hidden lg:flex items-center gap-2 border-l pl-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 overflow-hidden">
                                {userImage && !imageError ? (
                                    <img
                                        src={userImage}
                                        alt={user?.name || 'User'}
                                        className="h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <img src={genderImages.small} alt={user?.name || 'User'} className="h-full w-full object-cover" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-xl border-primary/10">
                            <DropdownMenuLabel className="font-bold text-base px-4 py-3">
                                {user?.name || 'My Account'}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="px-4 py-3 cursor-pointer focus:bg-primary/5 rounded-xl mx-1"
                                onClick={() => navigate('/settings')}
                            >
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="px-4 py-3 cursor-pointer focus:bg-primary/5 rounded-xl mx-1"
                                onClick={toggleTheme}
                            >
                                {isDark ? (
                                    <>
                                        <Sun className="h-4 w-4 mr-2" />
                                        Light Mode
                                    </>
                                ) : (
                                    <>
                                        <Moon className="h-4 w-4 mr-2" />
                                        Dark Mode
                                    </>
                                )}
                            </DropdownMenuItem>
                            {isDark && (
                                <DropdownMenuItem
                                    className="px-4 py-3 cursor-pointer focus:bg-primary/5 rounded-xl mx-1"
                                    onClick={toggleAmoled}
                                >
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    AMOLED Mode {isAmoled ? '(On)' : '(Off)'}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                className="px-4 py-3 cursor-pointer text-destructive focus:bg-destructive/5 rounded-xl mx-1"
                                onClick={() => signOut()}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filter Content Slot (e.g. Filter Pills) */}
            {filterContent && (
                <div className="border-t px-4 py-2 bg-background/50 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto">
                        {filterContent}
                    </div>
                </div>
            )}

            {/* Mobile Search Overlay */}
            {isMobileSearchVisible && (
                <div className="fixed inset-x-0 top-0 h-16 bg-background z-[60] flex items-center px-4 gap-2 lg:hidden shadow-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            autoFocus
                            className="pl-10 pr-10 h-10 w-full bg-secondary/50 border-none rounded-xl focus-visible:ring-primary"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                onSearchChangeRef.current?.(e.target.value);
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    onSearchChangeRef.current?.('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileSearchVisible(false)}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </header>
    );
};
