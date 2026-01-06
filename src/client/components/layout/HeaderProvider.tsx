import React, { createContext, useContext, useState, useRef, type ReactNode } from 'react';

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
    // Callback for when search changes in Header - called directly by Header
    onSearchChangeRef: React.MutableRefObject<((query: string) => void) | undefined>;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [title, setTitle] = useState('Pabili');
    const [actions, setActions] = useState<ReactNode | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchPlaceholder, setSearchPlaceholder] = useState('Search...');
    const [filterContent, setFilterContent] = useState<ReactNode | null>(null);
    const onSearchChangeRef = useRef<((query: string) => void) | undefined>(undefined);

    return (
        <HeaderContext.Provider value={{
            title, setTitle,
            actions, setActions,
            showSearch, setShowSearch,
            searchQuery, setSearchQuery,
            searchPlaceholder, setSearchPlaceholder,
            filterContent, setFilterContent,
            onSearchChangeRef
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
            setFilterContent,
            onSearchChangeRef
        } = useHeader();

        // Register the callback so Header can call it directly
        onSearchChangeRef.current = onSearchChange;

        // Sync title
        React.useEffect(() => {
            if (title !== undefined) setTitle(title);
        }, [title, setTitle]);

        // Sync showSearch
        React.useEffect(() => {
            setShowSearch(showSearch);
        }, [showSearch, setShowSearch]);

        // Sync searchPlaceholder
        React.useEffect(() => {
            if (searchPlaceholder !== undefined) setSearchPlaceholder(searchPlaceholder);
        }, [searchPlaceholder, setSearchPlaceholder]);

        // Sync searchQuery from page to context (one-way: page → context)
        React.useEffect(() => {
            if (searchQuery !== undefined) setSearchQuery(searchQuery);
        }, [searchQuery, setSearchQuery]);

        // Sync actions - use ref to avoid triggering on every render
        const actionsRef = useRef(actions);
        React.useEffect(() => {
            actionsRef.current = actions;
            setActions(actions || null);
        });

        // Sync filterContent - use ref to avoid triggering on every render  
        const filterRef = useRef(filterContent);
        React.useEffect(() => {
            filterRef.current = filterContent;
            setFilterContent(filterContent || null);
        });

        return null;
    };

