import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SidebarContextType {
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isCollapsed, setCollapsed] = useLocalStorage<boolean>('pabili-sidebar-collapsed', false);

    const toggleCollapsed = useCallback(() => {
        setCollapsed(prev => !prev);
    }, [setCollapsed]);

    // Apply CSS variable to root for easy access in CSS
    React.useEffect(() => {
        const root = document.documentElement;
        if (isCollapsed) {
            root.style.setProperty('--sidebar-width', '80px');
        } else {
            root.style.setProperty('--sidebar-width', '256px');
        }
    }, [isCollapsed]);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setCollapsed, toggleCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
