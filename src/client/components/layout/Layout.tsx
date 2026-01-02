import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="app-layout">
            <Header />

            <div className="app-main-wrapper">
                <Sidebar />

                <main className="app-main">
                    <div className="app-container">
                        {children}
                    </div>
                </main>
            </div>

            <BottomNav />
        </div>
    );
};
