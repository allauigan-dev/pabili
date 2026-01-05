import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Outlet } from 'react-router-dom';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Layout: React.FC = () => {
    const { touchHandlers, style, isSwiping, direction, distance } = useSwipeNavigation();

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">
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

            <div
                className="flex-1 flex flex-col md:ml-64 mb-16 md:mb-0 touch-pan-y"
                {...touchHandlers}
                style={style}
            >
                <main className="flex-1 md:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </div>
    );
};
