import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { HeaderProvider } from './HeaderProvider';
import { SidebarProvider } from './SidebarProvider';
import { Outlet } from 'react-router-dom';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Layout: React.FC = () => {
    const { touchHandlers, style, isSwiping, direction, distance } = useSwipeNavigation();

    return (
        <SidebarProvider>
            <HeaderProvider>
                <div className="app-layout">
                    <Header />

                    <div className="app-main-wrapper">
                        <Sidebar />

                        {/* Visual feedback indicators */}
                        {isSwiping && Math.abs(distance) > 30 && (
                            <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-between px-4 md:hidden">
                                <div
                                    className="p-3 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 transition-all duration-300"
                                    style={{
                                        opacity: direction === 'right' ? Math.min(Math.abs(distance) / 100, 1) : 0,
                                        transform: direction === 'right' ? `translateX(${Math.min(Math.abs(distance) / 2 - 20, 0)}px)` : 'none'
                                    }}
                                >
                                    <ChevronLeft className="h-6 w-6 text-primary" />
                                </div>
                                <div
                                    className="p-3 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 transition-all duration-300"
                                    style={{
                                        opacity: direction === 'left' ? Math.min(Math.abs(distance) / 100, 1) : 0,
                                        transform: direction === 'left' ? `translateX(${Math.max(20 - Math.abs(distance) / 2, 0)}px)` : 'none'
                                    }}
                                >
                                    <ChevronRight className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        )}

                        <main
                            className="app-main touch-pan-y"
                            {...touchHandlers}
                            style={style}
                        >
                            <div className="app-container">
                                <Outlet />
                            </div>
                        </main>
                    </div>

                    <BottomNav />
                </div>
            </HeaderProvider>
        </SidebarProvider>
    );
};
