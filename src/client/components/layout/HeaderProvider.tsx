import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderContextType {
    title: string;
    setTitle: (title: string) => void;
    actions: ReactNode | null;
    setActions: (actions: ReactNode | null) => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchPlaceholder: string;
    setSearchPlaceholder: (placeholder: string) => void;
    filterContent: ReactNode | null;
    setFilterContent: (content: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [title, setTitle] = useState('Pabili');
    const [actions, setActions] = useState<ReactNode | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchPlaceholder, setSearchPlaceholder] = useState('Search...');
    const [filterContent, setFilterContent] = useState<ReactNode | null>(null);

    return (
        <HeaderContext.Provider value={{
            title, setTitle,
            actions, setActions,
            showSearch, setShowSearch,
            searchQuery, setSearchQuery,
            searchPlaceholder, setSearchPlaceholder,
            filterContent, setFilterContent
        }}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (context === undefined) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
};

export const HeaderContent: React.FC<{
    title?: string;
    actions?: ReactNode;
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    filterContent?: ReactNode;
}> = ({
    title,
    actions,
    showSearch = false,
    searchPlaceholder,
    searchQuery,
    onSearchChange,
    filterContent
}) => {
        const {
            setTitle,
            setActions,
            setShowSearch,
            setSearchPlaceholder,
            setSearchQuery,
            setFilterContent
        } = useHeader();

        React.useEffect(() => {
            if (title !== undefined) setTitle(title);
            setActions(actions || null);
            setShowSearch(showSearch);
            if (searchPlaceholder !== undefined) setSearchPlaceholder(searchPlaceholder);
            if (searchQuery !== undefined) setSearchQuery(searchQuery);
            setFilterContent(filterContent || null);

            // We don't want to reset everything on every render, but we want to clean up if needed
            // However, usually pages will just overwrite these.
        }, [title, actions, showSearch, searchPlaceholder, searchQuery, filterContent]);

        // Handle search query updates from within the component if provided
        React.useEffect(() => {
            if (onSearchChange && searchQuery !== undefined) {
                onSearchChange(searchQuery);
            }
        }, [searchQuery, onSearchChange]);

        return null;
    };
