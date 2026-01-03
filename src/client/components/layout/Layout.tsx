import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-64 mb-16 md:mb-0">
                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>

            <BottomNav />
        </div>
    );
};
